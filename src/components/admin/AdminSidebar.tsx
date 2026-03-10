'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, List, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/listings', icon: List, label: 'Listings' },
  { href: '/admin/users', icon: Users, label: 'Users' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 min-h-screen border-r border-gray-100 bg-white p-4">
      <div className="font-bold text-lg mb-6" style={{ color: 'var(--navy)' }}>Admin</div>
      <nav className="space-y-1">
        {links.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}
            className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === href ? 'text-white' : 'text-gray-600 hover:bg-gray-50')}
            style={pathname === href ? { background: 'var(--navy)' } : {}}>
            <Icon className="w-4 h-4" />{label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
