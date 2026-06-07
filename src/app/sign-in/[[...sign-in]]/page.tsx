import { SignIn } from '@clerk/nextjs';
import { Navbar } from '@/components/layout/Navbar';

export default function Page() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <SignIn appearance={{
          variables: {
            colorPrimary: '#E8431A',
            fontSize: '15px',
          },
          elements: {
            formButtonPrimary: { fontSize: '15px', fontWeight: 700 },
            card: { boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
          },
        }} />
      </div>
    </div>
  );
}
