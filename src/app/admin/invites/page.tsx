import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import InvitesClient from "./ui/invites-client";

export default async function AdminInvitesPage() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;

  if (!session) redirect("/login");
  if (role !== "ADMIN") redirect("/");

  return (
    <main>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Инвайты</h1>
          <p className="mt-1 text-sm text-zinc-600">Создание, отзыв и удаление инвайтов</p>
        </div>
        <InvitesClient />
      </div>
    </main>
  );
}
