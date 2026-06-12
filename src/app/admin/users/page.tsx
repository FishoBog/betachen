import { createClient } from "@supabase/supabase-js";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { auth } from "@clerk/nextjs/server";
import { canAccessSection } from "@/lib/permissions";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);

const ASSIGNABLE_ROLES = ["user", "owner", "admin", "super_admin", "listings_admin", "payments_admin", "support"];

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { userId } = await auth();
  // Only a super_admin (the 'roles' permission) may change roles.
  const canManageRoles = await canAccessSection(userId, "roles");

  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100);
  return (
    <div style={{display:"flex",width:"100%",minHeight:"100vh"}}>
      <AdminSidebar />
      <main style={{flex:1,padding:"2rem",background:"#f9fafb"}}>
        <h1 style={{fontSize:"1.5rem",fontWeight:"700",marginBottom:"1.5rem",color:"#111827"}}>Users ({users?.length ?? 0})</h1>

        {error === "self_demote" && (
          <div style={{marginBottom:"1rem",padding:"0.75rem 1rem",borderRadius:"8px",background:"#fef2f2",border:"1px solid #fecaca",color:"#b91c1c",fontSize:"0.875rem"}}>
            You can’t remove your own super-admin role.
          </div>
        )}
        {canManageRoles && (
          <p style={{marginBottom:"1rem",fontSize:"0.8125rem",color:"#6b7280"}}>
            As a super-admin you can change team members’ roles below. Changes take effect immediately.
          </p>
        )}

        <div style={{background:"white",borderRadius:"12px",border:"1px solid #e5e7eb",overflow:"hidden"}}>
          <table style={{width:"100%",fontSize:"0.875rem",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:"#f9fafb"}}>
                {["Name","Email","Role","Verified","Joined"].map(h => (
                  <th key={h} style={{textAlign:"left",padding:"0.75rem 1rem",fontWeight:"600",color:"#6b7280",fontSize:"0.75rem",textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users && users.length > 0 ? users.map((user: any) => (
                <tr key={user.id} style={{borderTop:"1px solid #f3f4f6"}}>
                  <td style={{padding:"0.75rem 1rem",fontWeight:"500",color:"#111827"}}>{user.full_name || user.first_name || "—"}</td>
                  <td style={{padding:"0.75rem 1rem",color:"#6b7280"}}>{user.email || "—"}</td>
                  <td style={{padding:"0.75rem 1rem"}}>
                    {canManageRoles ? (
                      <form action="/api/admin/roles" method="POST" style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
                        <input type="hidden" name="clerkId" value={user.clerk_id} />
                        <select name="role" defaultValue={user.role || "user"} style={{padding:"4px 8px",borderRadius:"6px",border:"1px solid #d1d5db",fontSize:"0.8125rem",color:"#374151",background:"white"}}>
                          {ASSIGNABLE_ROLES.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <button type="submit" style={{padding:"4px 10px",fontSize:"0.75rem",background:"#111827",color:"white",borderRadius:"6px",border:"none",cursor:"pointer"}}>Save</button>
                      </form>
                    ) : (
                      <span style={{textTransform:"capitalize",color:"#6b7280"}}>{user.role || "user"}</span>
                    )}
                  </td>
                  <td style={{padding:"0.75rem 1rem"}}>
                    {user.is_verified
                      ? <span style={{padding:"2px 8px",borderRadius:"9999px",fontSize:"0.75rem",fontWeight:"500",background:"#dcfce7",color:"#15803d"}}>✓ Verified</span>
                      : <span style={{padding:"2px 8px",borderRadius:"9999px",fontSize:"0.75rem",background:"#f3f4f6",color:"#6b7280"}}>Unverified</span>
                    }
                  </td>
                  <td style={{padding:"0.75rem 1rem",color:"#9ca3af"}}>{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} style={{padding:"2rem",textAlign:"center",color:"#9ca3af"}}>No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
