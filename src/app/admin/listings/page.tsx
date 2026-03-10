import { createServerClient } from '@/lib/supabase';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { formatPrice } from '@/lib/utils';

export default async function AdminListings() {
  const supabase = createServerClient();
  const { data: properties } = await supabase.from('properties').select('id,title,status,price,currency,type,created_at').order('created_at', { ascending: false }).limit(50);
  return (
    <div className="flex flex-1">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--navy)' }}>All Listings</h1>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100"><tr>{['Title','Type','Price','Status','Date'].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {(properties ?? []).map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-gray-500">{p.type}</td>
                  <td className="px-4 py-3">{formatPrice(p.price, p.currency)}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-gray-100">{p.status}</span></td>
                  <td className="px-4 py-3 text-gray-400">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
