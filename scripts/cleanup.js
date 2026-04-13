const fs = require("fs");
const path = require("path");

const base = "f:\\OneDrive\\Desktop\\Dr_Welnes";

const items = [
  path.join("src", "app", "(site)"),
  path.join("scripts", "move-to-site.js"),
  path.join("scripts", "dump-users.ts"),
  path.join("scripts", "check-users.ts"),
];

items.forEach((item) => {
  const fullPath = path.join(base, item);
  if (fs.existsSync(fullPath)) {
    try {
      if (fs.lstatSync(fullPath).isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullPath);
      }
      console.log(`Deleted ${item}`);
    } catch (err) {
      console.error(`Error deleting ${item}: ${err.message}`);
    }
  }
});
