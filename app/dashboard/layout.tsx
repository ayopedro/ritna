import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Dashboard - RITNA',
  description:
    'Rumbles In The New Academy. A book by Sub-Lieutenant Oluwafemi Akinwumi.',
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export default DashboardLayout;
