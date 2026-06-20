import { Navbar } from '@/components/layout/Navbar';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <DashboardShell>{children}</DashboardShell>
    </>
  );
}
