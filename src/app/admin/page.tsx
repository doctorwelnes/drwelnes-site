import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminDashboard from "./AdminDashboard";

export const metadata = {
  title: "IDE Admin | Dr.Welnes",
};

export default async function AdminPage() {
  // ВРЕМЕННО ОТКЛЮЧЕНО ДЛЯ ТЕСТИРОВАНИЯ (Bypass mode)
  /*
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }
  */

  return <AdminDashboard username="Admin (Bypass Mode)" />;
}
