import { createServerClient } from '@/lib/supabase';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminDashboard() {
  const supabase = createServerClient();
  const [{ count: propCount }, { count: userCount }] = await Promise.all([
    supabase.from('properties').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ]);
  return (
    <div className="flex flex-1">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--navy)' }}>Admin Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-5 text-center"><div className="text-3xl font-bold" style={{ color: 'var(--navy)' }}>{propCount ?? 0}</div><div className="text-sm text-gray-500 mt-1">Properties</div></div>
          <div className="card p-5 text-center"><div className="text-3xl font-bold" style={{ color: 'var(--navy)' }}>{userCount ?? 0}</div><div className="text-sm text-gray-500 mt-1">Users</div></div>
        </div>
      </main>
    </div>
  );
}
