import { createClient } from "@supabase/supabase-js";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
export default async function AdminVerificationsPage() {
  const { data: requests } = await supabase.from("verification_requests").select("*").order("created_at", { ascending: false }).limit(50);
  const statusColors: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };
  return (
    <div style={{display:"flex",width:"100%",minHeight:"100vh"}}>
      <AdminSidebar />
      <main style={{flex:1,padding:"2rem",background:"#f9fafb"}}>
        <h1 style={{fontSize:"1.5rem",fontWeight:"700",marginBottom:"1.5rem",color:"#1e3a5f"}}>Owner Badge Verifications</h1>
        <div style={{display:"grid",gap:"1rem"}}>
          {requests && requests.length > 0 ? requests.map((req: any) => (
            <div key={req.id} style={{background:"white",borderRadius:"12px",border:"1px solid #e5e7eb",padding:"1.25rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"1rem"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.5rem"}}>
                    <span style={{padding:"2px 8px",borderRadius:"9999px",fontSize:"0.75rem",fontWeight:"500"}} className={statusColors[req.status]}>{req.status}</span>
                    <span style={{fontSize:"0.75rem",color:"#9ca3af"}}>{new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{fontSize:"0.875rem",color:"#4b5563",marginBottom:"0.25rem"}}><strong>User ID:</strong> {req.user_id}</p>
                  {req.notes && <p style={{fontSize:"0.875rem",color:"#4b5563"}}><strong>Notes:</strong> {req.notes}</p>}
                  {req.id_document_url && <p style={{fontSize:"0.875rem",color:"#2563eb",marginTop:"0.5rem"}}>ID document uploaded</p>}
                </div>
                {req.status === "pending" && (
                  <div style={{display:"flex",gap:"0.5rem",flexShrink:0}}>
                    <form action="/api/admin/verify" method="POST">
                      <input type="hidden" name="requestId" value={req.id} />
                      <input type="hidden" name="userId" value={req.user_id} />
                      <button name="action" value="approve" style={{padding:"6px 12px",fontSize:"0.875rem",background:"#16a34a",color:"white",borderRadius:"8px",border:"none",cursor:"pointer",fontWeight:"500"}}>Approve</button>
                    </form>
                    <form action="/api/admin/verify" method="POST">
                      <input type="hidden" name="requestId" value={req.id} />
                      <input type="hidden" name="userId" value={req.user_id} />
                      <button name="action" value="reject" style={{padding:"6px 12px",fontSize:"0.875rem",background:"#fee2e2",color:"#b91c1c",borderRadius:"8px",border:"none",cursor:"pointer",fontWeight:"500"}}>Reject</button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div style={{background:"white",borderRadius:"12px",border:"1px solid #e5e7eb",padding:"3rem",textAlign:"center",color:"#9ca3af"}}>No verification requests yet.</div>
          )}
        </div>
      </main>
    </div>
  );
}