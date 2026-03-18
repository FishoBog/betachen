import { createClient } from "@supabase/supabase-js";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
export default async function AdminVerificationsPage() {
  const { data: requests } = await supabase.from("verification_requests").select("*").order("created_at", { ascending: false }).limit(50);
  const statusColors: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };
  return (
    <div className="flex flex-1">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--navy)" }}>Owner Badge Verifications</h1>
        <div className="grid gap-4">
          {requests && requests.length > 0 ? requests.map((req: any) => (
            <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[req.status] ?? "bg-gray-100 text-gray-600"}`}>{req.status}</span>
                    <span className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1"><span className="font-medium">User ID:</span> {req.user_id}</p>
                  {req.notes && <p className="text-sm text-gray-600"><span className="font-medium">Notes:</span> {req.notes}</p>}
                  {req.id_document_url && <p className="text-sm text-blue-600 mt-2">ID document uploaded</p>}
                </div>
                {req.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <form action="/api/admin/verify" method="POST">
                      <input type="hidden" name="requestId" value={req.id} />
                      <input type="hidden" name="userId" value={req.user_id} />
                      <button name="action" value="approve" className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Approve</button>
                    </form>
                    <form action="/api/admin/verify" method="POST">
                      <input type="hidden" name="requestId" value={req.id} />
                      <input type="hidden" name="userId" value={req.user_id} />
                      <button name="action" value="reject" className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium">Reject</button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">No verification requests yet.</div>
          )}
        </div>
      </main>
    </div>
  );
}
