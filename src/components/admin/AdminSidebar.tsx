'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, List, Users, BadgeCheck, CreditCard } from 'lucide-react';

const links = [
  { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/listings', icon: List, label: 'Listings' },
  { href: '/admin/verifications', icon: BadgeCheck, label: 'Badges' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/payments', icon: CreditCard, label: 'Payments' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 min-h-screen border-r border-gray-200 bg-white flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <div>
            <div className="font-bold text-gray-900">Gojo Admin</div>
            <div className="text-xs text-gray-400">ጎጆ Dashboard</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50">
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}