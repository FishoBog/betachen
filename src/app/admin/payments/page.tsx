import { createClient } from "@supabase/supabase-js";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
export default async function AdminPaymentsPage() {
  const [{ data: listingPayments }, { data: reservations }] = await Promise.all([
    supabase.from("listing_payments").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("reservations").select("*").order("created_at", { ascending: false }).limit(50),
  ]);
  const totalRevenue = (listingPayments ?? []).filter((p: any) => p.status === "paid").reduce((sum: number, p: any) => sum + (p.amount ?? 0), 0);
  const depositRevenue = (reservations ?? []).filter((r: any) => r.payment_status === "paid").reduce((sum: number, r: any) => sum + (r.deposit_amount ?? 0), 0);
  return (
    <div style={{display:"flex",width:"100%",minHeight:"100vh"}}>
      <AdminSidebar />
      <main style={{flex:1,padding:"2rem",background:"#f9fafb"}}>
        <h1 style={{fontSize:"1.5rem",fontWeight:"700",marginBottom:"1.5rem",color:"#111827"}}>Payments & Revenue</h1>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1rem",marginBottom:"2rem"}}>
          {[
            {label:"Listing Fee Revenue",value:totalRevenue,color:"#f0fdf4",text:"#15803d"},
            {label:"Deposit Revenue",value:depositRevenue,color:"#eff6ff",text:"#1d4ed8"},
            {label:"Total Combined",value:totalRevenue+depositRevenue,color:"#faf5ff",text:"#7e22ce"},
          ].map((s) => (
            <div key={s.label} style={{background:s.color,borderRadius:"12px",padding:"1.25rem"}}>
              <div style={{fontSize:"0.875rem",fontWeight:"500",color:s.text,marginBottom:"0.25rem"}}>{s.label}</div>
              <div style={{fontSize:"1.875rem",fontWeight:"700",color:s.text}}>ETB {s.value.toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div style={{background:"white",borderRadius:"12px",border:"1px solid #e5e7eb",overflow:"hidden"}}>
          <div style={{padding:"1rem 1.25rem",borderBottom:"1px solid #f3f4f6"}}>
            <h3 style={{fontWeight:"600",color:"#111827",fontSize:"1rem"}}>Listing Payments</h3>
          </div>
          <table style={{width:"100%",fontSize:"0.875rem",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:"#f9fafb"}}>
                {["Property ID","Amount (ETB)","Type","Status","Date"].map(h => (
                  <th key={h} style={{textAlign:"left",padding:"0.75rem 1rem",fontWeight:"600",color:"#6b7280",fontSize:"0.75rem",textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listingPayments && listingPayments.length > 0 ? listingPayments.map((p: any) => (
                <tr key={p.id} style={{borderTop:"1px solid #f3f4f6"}}>
                  <td style={{padding:"0.75rem 1rem",fontFamily:"monospace",fontSize:"0.75rem"}}>{p.property_id?.slice(0,8)}...</td>
                  <td style={{padding:"0.75rem 1rem",fontWeight:"600"}}>{p.amount?.toLocaleString()}</td>
                  <td style={{padding:"0.75rem 1rem",textTransform:"capitalize"}}>{p.payment_type ?? "listing"}</td>
                  <td style={{padding:"0.75rem 1rem"}}>
                    <span style={{padding:"2px 8px",borderRadius:"9999px",fontSize:"0.75rem",fontWeight:"500",background:p.status==="paid"?"#dcfce7":"#fef9c3",color:p.status==="paid"?"#15803d":"#854d0e"}}>{p.status}</span>
                  </td>
                  <td style={{padding:"0.75rem 1rem",color:"#9ca3af"}}>{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} style={{padding:"2rem",textAlign:"center",color:"#9ca3af"}}>No payments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}