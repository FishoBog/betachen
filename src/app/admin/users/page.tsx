import { createClient } from "@supabase/supabase-js";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
export default async function AdminUsersPage() {
  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100);
  return (
    <div style={{display:"flex",width:"100%",minHeight:"100vh"}}>
      <AdminSidebar />
      <main style={{flex:1,padding:"2rem",background:"#f9fafb"}}>
        <h1 style={{fontSize:"1.5rem",fontWeight:"700",marginBottom:"1.5rem",color:"#111827"}}>Users ({users?.length ?? 0})</h1>
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
                  <td style={{padding:"0.75rem 1rem",textTransform:"capitalize",color:"#6b7280"}}>{user.role || "user"}</td>
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