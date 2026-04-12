'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, List, Users, BadgeCheck, CreditCard, Tag } from 'lucide-react';
const links = [
  { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/listings', icon: List, label: 'Listings' },
  { href: '/admin/verifications', icon: BadgeCheck, label: 'Badges' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { href: '/admin/discounts', icon: Tag, label: 'Discount Codes' },
];
export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside style={{width:"240px",minHeight:"100vh",borderRight:"1px solid #e5e7eb",background:"white",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"1.25rem 1.5rem",borderBottom:"1px solid #f3f4f6",display:"flex",alignItems:"center",gap:"0.75rem"}}>
        <span style={{fontSize:"1.75rem"}}>🏠</span>
        <div>
          <div style={{fontWeight:"700",color:"#111827",fontSize:"0.95rem"}}>Betachen Admin</div>
          <div style={{fontSize:"0.7rem",color:"#9ca3af"}}>ቤታችን Dashboard</div>
        </div>
      </div>
      <nav style={{flex:1,padding:"1rem"}}>
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.625rem 0.75rem",borderRadius:"8px",fontSize:"0.875rem",fontWeight:"500",marginBottom:"4px",textDecoration:"none",background:active?"#111827":"transparent",color:active?"white":"#4b5563"}}>
              <Icon style={{width:"16px",height:"16px",flexShrink:0}} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div style={{padding:"1rem",borderTop:"1px solid #f3f4f6"}}>
        <Link href="/" style={{display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.5rem 0.75rem",fontSize:"0.875rem",color:"#6b7280",textDecoration:"none",borderRadius:"8px"}}>
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
