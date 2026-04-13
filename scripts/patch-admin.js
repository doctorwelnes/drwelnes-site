const fs = require("fs");
const path = "f:/OneDrive/Desktop/Dr_Welnes/src/app/admin/AdminDashboard.tsx";
let c = fs.readFileSync(path, "utf-8");
const before = c.length;

// 1. Fix step numbering - change padStart to simple i+1
c = c.split('{String(i + 1).padStart(2, "0")}').join("{i + 1}");
c = c
  .split("text-neutral-700 font-black mt-3 leading-none w-4")
  .join("text-neutral-600 font-black mt-3 leading-none w-4");

// 2. Ingredient header with count badge
const ingH3Old =
  'className="text-[10px] uppercase text-neutral-500 font-black tracking-[0.2em]">\r\n                                   \u0418\u043d\u0433\u0440\u0435\u0434\u0438\u0435\u043d\u0442\u044b\r\n                                 </h3>';
const ingH3New =
  'className="text-[10px] uppercase text-neutral-500 font-black tracking-[0.2em] flex items-center gap-2">\r\n                                   \u0418\u043d\u0433\u0440\u0435\u0434\u0438\u0435\u043d\u0442\u044b{(frontmatter.ingredients?.length ?? 0) > 0 ? <span className="text-amber-600/60 font-mono normal-case ml-1">({frontmatter.ingredients?.length})</span> : null}\r\n                                 </h3>';
c = c.split(ingH3Old).join(ingH3New);

// 3. Steps header with count badge
const stepsH3Old =
  'className="text-[10px] uppercase text-neutral-500 font-black tracking-[0.2em]">\r\n                                   \u0418\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u044f\r\n                                 </h3>';
const stepsH3New =
  'className="text-[10px] uppercase text-neutral-500 font-black tracking-[0.2em] flex items-center gap-2">\r\n                                   \u0418\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u044f{(frontmatter.steps?.length ?? 0) > 0 ? <span className="text-amber-600/60 font-mono normal-case ml-1">({frontmatter.steps?.length} \u0448\u0430\u0433\u043e\u0432)</span> : null}\r\n                                 </h3>';
c = c.split(stepsH3Old).join(stepsH3New);

fs.writeFileSync(path, c, "utf-8");
console.log("Done. File size before:", before, "after:", c.length);
console.log("padStart present:", c.includes("padStart"));
console.log("ing count badge present:", c.includes("ingredients?.length"));
console.log("steps count badge present:", c.includes("steps?.length"));
