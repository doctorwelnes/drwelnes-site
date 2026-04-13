import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Dr.Welnes",
  icons: {
    icon: "/admin-favicon.png",
    apple: "/admin-favicon.png",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
