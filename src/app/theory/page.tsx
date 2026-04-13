import { getAllTheory } from "@/lib/content";
import TheoryClient from "./theory-client";

export const dynamic = "force-static";

export default function TheoryPage() {
  const articles = getAllTheory();

  return (
    <main>
      <TheoryClient articles={articles} />
    </main>
  );
}
