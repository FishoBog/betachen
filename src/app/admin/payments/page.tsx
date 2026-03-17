import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminPaymentsPage() {
  const [{ data: listingPayments }, { data: featuredPayments }, { data: reservations }] =
    await Promise.all([
      supabase.from("listing_payments").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("featured_payments").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("reservations").select("*").order("created_at", { ascending: false }).limit(50),
    ]);

  const totalRevenue = [
    ...(listingPayments ?? []),
    ...(featuredPayments ?? []),
  ]
    .filter((p: any) => p.status === "paid")
    .reduce((sum: number, p: any) => sum + (p.amount ?? 0), 0);

  const depositRevenue = (reservations ?? [])
    .filter((r: any) => r.payment_status === "paid")
    .reduce((sum: number, r: any) => sum + (r.deposit_amount ?? 0), 0);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Payments & Revenue</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 rounded-xl p-5">
          <div className="text-sm text-green-600 font-medium mb-1">Listing Fee Revenue</div>
          <div className="text-3xl font-bold text-green-700">ETB {totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-5">
          <div className="text-sm text-blue-600 font-medium mb-1">Deposit Revenue</div>
          <div className="text-3xl font-bold text-blue-700">ETB {depositRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-5">
          <div className="text-sm text-purple-600 font-medium mb-1">Total Combined</div>
          <div className="text-3xl font-bold text-purple-700">ETB {(totalRevenue + depositRevenue).toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Listing Payments</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
              <th className="px-4 py-3">Property ID</th>
              <th className="px-4 py-3">Amount (ETB)</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {listingPayments && listingPayments.length > 0 ? (
              listingPayments.map((p: any) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-xs">{p.property_id?.slice(0, 8)}...</td>
                  <td className="px-4 py-2 font-semibold">{p.amount?.toLocaleString()}</td>
                  <td className="px-4 py-2 capitalize">{p.payment_type ?? "listing"}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No payments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
