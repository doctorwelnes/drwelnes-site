import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import WorkoutDetailClient from "./ui/workout-detail-client";

export default async function WorkoutDetailPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <main>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <WorkoutDetailClient />
      </div>
    </main>
  );
}
