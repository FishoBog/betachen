import { createClient } from "@supabase/supabase-js";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function AdminListingsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter = "all" } = await searchParams;

  let query = supabase.from("properties").select("id, title, property_type, listing_type, price, currency, status, created_at").order("created_at", { ascending: false });

  if (filter === "pending") query = query.eq("status", "pending");
  if (filter === "active") query = query.eq("status", "active");
  if (filter === "expired") query = query.eq("status", "expired");

  const { data: listings } = await query.limit(50);

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    expired: "bg-red-100 text-red-700",
    sold: "bg-blue-100 text-blue-700",
    rented: "bg-purple-100 text-purple-700",
    under_contract: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="flex flex-1">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: "var(--navy)" }}>All Listings</h1>
          <div className="flex gap-2">
            {["all", "pending", "active", "expired"].map((f) => (
              <a key={f} href={`/admin/listings${f !== "all" ? `?filter=${f}` : ""}`} className={`px-3 py-1 rounded-full text-sm font-medium capitalize border transition ${filter === f ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:border-gray-900"}`}>{f}</a>
            ))}
          </div>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Title", "Type", "Price", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(listings ?? []).map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{p.title || "Untitled"}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{p.listing_type || p.property_type}</td>
                  <td className="px-4 py-3">{p.currency} {p.price?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[p.status] ?? "bg-gray-100 text-gray-600"}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                      <a href={`/properties/${p.id}`} target="_blank" className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">View</a>
                      {p.status === "pending" && (
                        <>
                          <form action="/api/admin/listings" method="POST" className="inline">
                            <input type="hidden" name="listingId" value={p.id} />
                            <button name="action" value="approve" className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">Approve</button>
                          </form>
                          <form action="/api/admin/listings" method="POST" className="inline">
                            <input type="hidden" name="listingId" value={p.id} />
                            <button name="action" value="reject" className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Reject</button>
                          </form>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {(!listings || listings.length === 0) && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No listings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}