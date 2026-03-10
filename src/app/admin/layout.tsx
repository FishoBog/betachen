import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Navbar } from '@/components/layout/Navbar';
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen"><Navbar /><div className="flex">{children}</div></div>;
}
