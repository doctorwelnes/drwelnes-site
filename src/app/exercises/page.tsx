import { getAllExercises } from "@/lib/content";
import ExercisesClient from "./exercises-client";

export const dynamic = "force-static";

export default function ExercisesPage() {
  const exercises = getAllExercises();

  return (
    <main>
      <ExercisesClient exercises={exercises} />
    </main>
  );
}
