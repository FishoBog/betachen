import { createServerClient } from '@/lib/supabase';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminUsers() {
  const supabase = createServerClient();
  const { data: users } = await supabase.from('profiles').select('id,full_name,phone,role,created_at').order('created_at', { ascending: false }).limit(50);
  return (
    <div className="flex flex-1">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--navy)' }}>Users</h1>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100"><tr>{['Name','Phone','Role','Joined'].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {(users ?? []).map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{u.phone ?? '—'}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-gray-100">{u.role}</span></td>
                  <td className="px-4 py-3 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
