/**
 * Ambient background glow effect used across multiple pages.
 * Replaces duplicated inline code in Home, About, Calculators, etc.
 */
export function BackgroundAmbience({
  intensity = "normal",
}: {
  intensity?: "subtle" | "normal" | "strong";
}) {
  const opacityMap = {
    subtle: { blob1: "10", blob2: "15" },
    normal: { blob1: "15", blob2: "25" },
    strong: { blob1: "20", blob2: "30" },
  };

  const { blob1, blob2 } = opacityMap[intensity];

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        className={`absolute top-0 right-[-10%] w-[50%] h-[50%] bg-[#f95700]/${blob1} blur-[160px] rounded-full animate-float-slow`}
      />
      <div
        className={`absolute -bottom-[20%] left-[5%] w-[60%] h-[60%] bg-[#f95700]/${blob2} blur-[160px] rounded-full animate-float`}
        style={{ animationDelay: "-10s" }}
      />
    </div>
  );
}
