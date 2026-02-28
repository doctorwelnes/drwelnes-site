import { Suspense } from "react";
import InviteClient from "./invite-client";

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-lg">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="h-7 w-40 animate-pulse rounded bg-zinc-200" />
            <div className="mt-2 h-4 w-56 animate-pulse rounded bg-zinc-100" />

            <div className="mt-6 space-y-4">
              <div>
                <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
                <div className="mt-2 h-9 w-full animate-pulse rounded bg-zinc-100" />
              </div>
              <div>
                <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
                <div className="mt-2 h-9 w-full animate-pulse rounded bg-zinc-100" />
              </div>
              <div>
                <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
                <div className="mt-2 h-9 w-full animate-pulse rounded bg-zinc-100" />
              </div>
              <div>
                <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
                <div className="mt-2 h-9 w-full animate-pulse rounded bg-zinc-100" />
              </div>
              <div className="h-9 w-full animate-pulse rounded bg-zinc-900/20" />
            </div>
          </div>
        </main>
      }
    >
      <InviteClient />
    </Suspense>
  );
}
