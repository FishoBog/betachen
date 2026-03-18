import { createClient } from "@supabase/supabase-js";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
export default async function AdminPage() {
  const [
    { count: totalListings },
    { count: pendingListings },
    { count: totalUsers },
    { count: pendingVerifications },
    { data: recentPayments },
  ] = await Promise.all([
    supabase.from("properties").select("*", { count: "exact", head: true }),
    supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("verification_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("listing_payments").select("*").order("created_at", { ascending: false }).limit(5),
  ]);
  const stats = [
    { label: "Total Listings", value: totalListings ?? 0, icon: "🏘️", bg: "#eff6ff", color: "#1d4ed8", href: "/admin/listings" },
    { label: "Pending Review", value: pendingListings ?? 0, icon: "⏳", bg: "#fefce8", color: "#854d0e", href: "/admin/listings?filter=pending" },
    { label: "Total Users", value: totalUsers ?? 0, icon: "👥", bg: "#f0fdf4", color: "#15803d", href: "/admin/users" },
    { label: "Pending Badges", value: pendingVerifications ?? 0, icon: "🔖", bg: "#faf5ff", color: "#7e22ce", href: "/admin/verifications" },
  ];
  return (
    <div style={{display:"flex",width:"100%",minHeight:"100vh"}}>
      <AdminSidebar />
      <main style={{flex:1,padding:"2rem",background:"#f9fafb"}}>
        <h1 style={{fontSize:"1.5rem",fontWeight:"700",marginBottom:"1.5rem",color:"#111827"}}>Dashboard Overview</h1>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1rem",marginBottom:"2rem"}}>
          {stats.map((s) => (
            <a key={s.label} href={s.href} style={{background:s.bg,borderRadius:"12px",padding:"1.25rem",textDecoration:"none",display:"block"}}>
              <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>{s.icon}</div>
              <div style={{fontSize:"2rem",fontWeight:"700",color:s.color}}>{s.value}</div>
              <div style={{fontSize:"0.875rem",fontWeight:"500",color:s.color,marginTop:"0.25rem"}}>{s.label}</div>
            </a>
          ))}
        </div>
        <div style={{background:"white",borderRadius:"12px",border:"1px solid #e5e7eb",padding:"1.5rem"}}>
          <h3 style={{fontWeight:"600",color:"#111827",fontSize:"1rem",marginBottom:"1rem"}}>Recent Payments</h3>
          {recentPayments && recentPayments.length > 0 ? (
            <table style={{width:"100%",fontSize:"0.875rem",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderBottom:"1px solid #e5e7eb"}}>
                  {["Property ID","Amount (ETB)","Type","Status","Date"].map(h => (
                    <th key={h} style={{textAlign:"left",paddingBottom:"0.5rem",color:"#6b7280",fontWeight:"500"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p: any) => (
                  <tr key={p.id} style={{borderBottom:"1px solid #f3f4f6"}}>
                    <td style={{padding:"0.5rem 0",fontFamily:"monospace",fontSize:"0.75rem"}}>{p.property_id?.slice(0,8)}...</td>
                    <td style={{padding:"0.5rem 0",fontWeight:"600"}}>{p.amount}</td>
                    <td style={{padding:"0.5rem 0",textTransform:"capitalize"}}>{p.payment_type ?? "listing"}</td>
                    <td style={{padding:"0.5rem 0"}}>
                      <span style={{padding:"2px 8px",borderRadius:"9999px",fontSize:"0.75rem",fontWeight:"500",background:p.status==="paid"?"#dcfce7":"#fef9c3",color:p.status==="paid"?"#15803d":"#854d0e"}}>{p.status}</span>
                    </td>
                    <td style={{padding:"0.5rem 0",color:"#9ca3af"}}>{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{color:"#9ca3af",fontSize:"0.875rem"}}>No payments yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}