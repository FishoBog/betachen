import { SignUp } from '@clerk/nextjs';
import { Navbar } from '@/components/layout/Navbar';

export default function Page() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '56px 24px' }}>
        <SignUp appearance={{
          variables: {
            colorPrimary: '#E8431A',
            fontSize: '15px',
          },
        }} />
      </div>
    </div>
  );
}
