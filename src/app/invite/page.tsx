import { Suspense } from "react";
import InviteClient from "./invite-client";

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-lg">Loading...</div>}>
      <InviteClient />
    </Suspense>
  );
}
