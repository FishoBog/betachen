import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';
import { ArrowRight, Video, Shield, Users, Home, CheckCircle, Phone } from 'lucide-react';

export default function DiasporaPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0a0f14 0%, #1a2a3a 50%, #0f3460 100%)', padding: '80px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://pqmdujnwudahviyvljmg.supabase.co/storage/v1/object/public/property-images/hero-addis.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E8431A', borderRadius: 20, padding: '8px 20px', marginBottom: 24 }}>
            <span style={{ color: 'white', fontSize: 13, fontWeight: 700, letterSpacing: '1px' }}>🌍 DIASPORA INVESTMENT HUB</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 20 }}>
            Invest in Ethiopia<br /><span style={{ color: '#FF6B35' }}>From Anywhere in the World</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, lineHeight: 1.7, marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
            ጎጆ Homes connects the Ethiopian diaspora with verified properties back home — with trusted agents, managed rentals, legal support and video tours so you can invest with confidence from abroad.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' as const }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#E8431A', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
              Browse Properties <ArrowRight size={18} />
            </Link>
            <a href="https://t.me/GojoEthiopiaBot" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}>
              ✈️ Talk to an Agent
            </a>
          </div>
        </div>
      </div>

      {/* What makes us different */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: '#111827', marginBottom: 12 }}>Why Diaspora Investors Choose ጎጆ</h2>
          <p style={{ color: '#6b7280', fontSize: 17, maxWidth: 560, margin: '0 auto' }}>
            We solve the 4 biggest challenges of investing in Ethiopia from abroad
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28 }}>
          {[
            {
              icon: Video,
              color: '#006AFF', bg: '#eff6ff',
              title: 'Video Call Tours',
              desc: 'Schedule a live video walkthrough of any property with our local agents. See every room, the neighborhood, road condition and surroundings — all from your phone or laptop.',
              tag: 'Available on request',
            },
            {
              icon: Users,
              color: '#059669', bg: '#ecfdf5',
              title: 'Trusted Local Agents',
              desc: 'Our verified agent network handles everything on the ground — property visits, negotiation, paperwork and follow-up. You decide, we execute.',
              tag: 'ID-verified agents',
            },
            {
              icon: Home,
              color: '#E8431A', bg: '#fef2ee',
              title: 'Managed Rental Service',
              desc: 'Own a property but live abroad? We manage it for you — finding tenants, collecting rent, handling maintenance and sending you monthly reports.',
              tag: 'Hands-off investment',
            },
            {
              icon: Shield,
              color: '#7c3aed', bg: '#f5f3ff',
              title: 'Legal & Title Verification',
              desc: 'Before you commit, our legal partners verify the title deed, ownership history and any encumbrances on the property — so you buy with confidence.',
              tag: 'No legal surprises',
            },
          ].map(({ icon: Icon, color, bg, title, desc, tag }) => (
            <div key={title} style={{ background: 'white', borderRadius: 20, border: '1px solid #e5e7eb', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Icon size={26} color={color} />
              </div>
              <div style={{ display: 'inline-block', background: bg, color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, marginBottom: 12, letterSpacing: '0.3px' }}>{tag}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 10 }}>{title}</h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: '#f9fafb', padding: '72px 24px', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#111827', marginBottom: 12 }}>How It Works</h2>
            <p style={{ color: '#6b7280', fontSize: 16 }}>From browsing to owning — here's how diaspora investment works on ጎጆ</p>
          </div>
          <div style={{ display: 'grid', gap: 20 }}>
            {[
              { step: '01', title: 'Browse verified listings', desc: 'Search properties filtered for diaspora buyers — verified ownership, clear photos and detailed information about location, utilities and access.' },
              { step: '02', title: 'Request a video tour', desc: 'Contact the agent or owner to schedule a live video walkthrough. Our local agents can attend on your behalf and ask questions for you.' },
              { step: '03', title: 'Legal verification', desc: 'Before paying anything, request a title deed and ownership verification through our legal partners. We confirm the property is clean and transferable.' },
              { step: '04', title: 'Secure the deal', desc: 'Agree on terms via our platform. Contracts are digitally signed. Payment is arranged through secure channels with full documentation.' },
              { step: '05', title: 'Managed or self-managed', desc: 'Once yours, choose to manage it yourself or let ጎጆ handle tenants, maintenance and monthly rent collection on your behalf.' },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ display: 'flex', gap: 20, background: 'white', borderRadius: 16, padding: '24px', border: '1px solid #e5e7eb' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#E8431A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 15, fontWeight: 900, flexShrink: 0 }}>{step}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 6 }}>{title}</div>
                  <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location privacy note */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ background: 'linear-gradient(135deg, #0a0f14, #1a2a3a)', borderRadius: 24, padding: '48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#E8431A', marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: '1px' }}>🔒 Privacy First</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>Exact locations shared only in private</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
              For owner privacy and security, public listings show only the approximate area. The precise address and location are shared privately between buyer and owner during direct conversation — at the owner's discretion.
            </p>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                'Public: Shows approximate area only (e.g. Bole, Addis Ababa)',
                'Private: Exact address shared in direct messages',
                'Owner controls when and to whom they share their location',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <CheckCircle size={16} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase' as const }}>What you see publicly</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>📍</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>Bole, Addis Ababa</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Approximate area • ~500m radius</div>
                </div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase' as const }}>What owner shares privately</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>🔒</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>Exact address + GPS</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Shared in direct message only</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: '#006AFF', padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 12 }}>Ready to invest in Ethiopia?</h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
          Browse verified properties, talk to a trusted agent or list your own property for diaspora buyers.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' as const }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#E8431A', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
            Browse Properties <ArrowRight size={18} />
          </Link>
          <a href="https://t.me/GojoEthiopiaBot" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: 'white', color: '#006AFF', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
            <Phone size={16} /> Contact an Agent
          </a>
        </div>
      </div>
    </div>
  );
}