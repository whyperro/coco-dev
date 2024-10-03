import AdminPanelLayout from "@/components/sidebar/AdminPanelLayout";

export default function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <AdminPanelLayout>{children}</AdminPanelLayout>;
}
