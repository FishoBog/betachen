import { createClient } from "@supabase/supabase-js";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    { label: "Total Listings", value: totalListings ?? 0, icon: "🏘️", color: "bg-blue-50 text-blue-700", href: "/admin/listings" },
    { label: "Pending Review", value: pendingListings ?? 0, icon: "⏳", color: "bg-yellow-50 text-yellow-700", href: "/admin/listings?filter=pending" },
    { label: "Total Users", value: totalUsers ?? 0, icon: "👥", color: "bg-green-50 text-green-700", href: "/admin/users" },
    { label: "Pending Badges", value: pendingVerifications ?? 0, icon: "🔖", color: "bg-purple-50 text-purple-700", href: "/admin/verifications" },
  ];

  return (
    <div className="flex flex-1">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--navy)" }}>
          Dashboard Overview
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            
              key={stat.label}
              href={stat.href}
              className={`rounded-xl p-5 ${stat.color} hover:opacity-80 transition`}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm font-medium mt-1">{stat.label}</div>
            </a>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
          {recentPayments && recentPayments.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Property ID</th>
                  <th className="pb-2">Amount (ETB)</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p: any) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2 font-mono text-xs">{p.property_id?.slice(0, 8)}...</td>
                    <td className="py-2 font-semibold">{p.amount}</td>
                    <td className="py-2 capitalize">{p.payment_type ?? "listing"}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2 text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400 text-sm">No payments yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
