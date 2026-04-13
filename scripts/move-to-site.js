const fs = require("fs");
const path = require("path");

const base = "f:\\OneDrive\\Desktop\\Dr_Welnes";
const target = path.join(base, "src", "app", "(site)");

const items = [
  "recipes",
  "theory",
  "calculators",
  "exercises",
  "workouts",
  "dashboard",
  "measurements",
  "invite",
  "templates",
  "login",
  "page.tsx",
];

if (!fs.existsSync(target)) {
  fs.mkdirSync(target, { recursive: true });
}

items.forEach((item) => {
  const oldPath = path.join(base, "src", "app", item);
  const newPath = path.join(target, item);

  if (fs.existsSync(oldPath)) {
    try {
      fs.renameSync(oldPath, newPath);
      console.log(`Successfully moved ${item}`);
    } catch (err) {
      console.error(`ERROR moving ${item}: ${err.message}`);
    }
  } else {
    console.log(`Skipping ${item} (not found at ${oldPath})`);
  }
});
