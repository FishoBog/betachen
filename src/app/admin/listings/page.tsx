import { createClient } from "@supabase/supabase-js";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
export default async function AdminListingsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter = "all" } = await searchParams;
  let query = supabase.from("properties").select("id, title, property_type, listing_type, type, price, currency, status, created_at").order("created_at", { ascending: false });
  if (filter === "pending") query = query.eq("status", "pending");
  if (filter === "active") query = query.eq("status", "active");
  if (filter === "expired") query = query.eq("status", "expired");
  const { data: listings } = await query.limit(50);
  const statusColors: Record<string, {bg:string,color:string}> = {
    active: {bg:"#dcfce7",color:"#15803d"},
    pending: {bg:"#fef9c3",color:"#854d0e"},
    pending_review: {bg:"#fef9c3",color:"#854d0e"},
    expired: {bg:"#fee2e2",color:"#b91c1c"},
    sold: {bg:"#dbeafe",color:"#1d4ed8"},
    rented: {bg:"#f3e8ff",color:"#7e22ce"},
    under_contract: {bg:"#ffedd5",color:"#c2410c"},
  };
  return (
    <div style={{display:"flex",width:"100%",minHeight:"100vh"}}>
      <AdminSidebar />
      <main style={{flex:1,padding:"2rem",background:"#f9fafb"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.5rem"}}>
          <h1 style={{fontSize:"1.5rem",fontWeight:"700",color:"#111827"}}>All Listings</h1>
          <div style={{display:"flex",gap:"0.5rem"}}>
            {["all","pending","active","expired"].map(f => (
              <a key={f} href={`/admin/listings${f !== "all" ? `?filter=${f}` : ""}`} style={{padding:"4px 14px",borderRadius:"9999px",fontSize:"0.875rem",fontWeight:"500",textTransform:"capitalize",textDecoration:"none",border:`1px solid ${filter===f||(f==="all"&&filter==="all")?"#111827":"#d1d5db"}`,background:filter===f||(f==="all"&&filter==="all")?"#111827":"white",color:filter===f||(f==="all"&&filter==="all")?"white":"#6b7280"}}>
                {f}
              </a>
            ))}
          </div>
        </div>
        <div style={{background:"white",borderRadius:"12px",border:"1px solid #e5e7eb",overflow:"hidden"}}>
          <table style={{width:"100%",fontSize:"0.875rem",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:"#f9fafb"}}>
                {["Title","Type","Price","Status","Date","Actions"].map(h => (
                  <th key={h} style={{textAlign:"left",padding:"0.75rem 1rem",fontWeight:"600",color:"#6b7280",fontSize:"0.75rem",textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listings && listings.length > 0 ? listings.map((p: any) => (
                <tr key={p.id} style={{borderTop:"1px solid #f3f4f6"}}>
                  <td style={{padding:"0.75rem 1rem",fontWeight:"500",color:"#111827",maxWidth:"200px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title || "Untitled"}</td>
                  <td style={{padding:"0.75rem 1rem",color:"#6b7280",textTransform:"capitalize"}}>{p.type || p.listing_type || p.property_type}</td>
                  <td style={{padding:"0.75rem 1rem",fontWeight:"600"}}>{p.currency} {p.price?.toLocaleString()}</td>
                  <td style={{padding:"0.75rem 1rem"}}>
                    <span style={{padding:"2px 10px",borderRadius:"9999px",fontSize:"0.75rem",fontWeight:"500",background:statusColors[p.status]?.bg??"#f3f4f6",color:statusColors[p.status]?.color??"#6b7280"}}>{p.status}</span>
                  </td>
                  <td style={{padding:"0.75rem 1rem",color:"#9ca3af"}}>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td style={{padding:"0.75rem 1rem"}}>
                    <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
                      <a href={`/properties/${p.id}`} target="_blank" style={{padding:"4px 10px",fontSize:"0.75rem",background:"#f3f4f6",color:"#374151",borderRadius:"6px",textDecoration:"none"}}>View</a>
                      {(p.status === "pending" || p.status === "pending_review") && (
                        <>
                          <form action="/api/admin/listings" method="POST" style={{display:"inline"}}>
                            <input type="hidden" name="listingId" value={p.id} />
                            <button name="action" value="approve" style={{padding:"4px 10px",fontSize:"0.75rem",background:"#dcfce7",color:"#15803d",borderRadius:"6px",border:"none",cursor:"pointer"}}>Approve</button>
                          </form>
                          <form action="/api/admin/listings" method="POST" style={{display:"inline"}}>
                            <input type="hidden" name="listingId" value={p.id} />
                            <button name="action" value="reject" style={{padding:"4px 10px",fontSize:"0.75rem",background:"#fee2e2",color:"#b91c1c",borderRadius:"6px",border:"none",cursor:"pointer"}}>Reject</button>
                          </form>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} style={{padding:"3rem",textAlign:"center",color:"#9ca3af"}}>No listings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
