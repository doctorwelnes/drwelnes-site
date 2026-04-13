const fs = require("fs");
try {
  let text = fs.readFileSync("src/app/design-lab/page.tsx", "utf-8");
  let count = 0;

  // replace all <img ... /> allowing newlines
  text = text.replace(/<img\s+([^>]+)\/?>/g, (match, attrs) => {
    count++;
    let newAttrs = attrs.trim();
    if (newAttrs.endsWith("/")) newAttrs = newAttrs.slice(0, -1).trim();
    // ensure we don't duplicate alt
    newAttrs = newAttrs.replace(/alt\s*=\s*"[^"]*"/g, "").trim();
    return `<Image width={800} height={800} alt="" ${newAttrs} />`;
  });

  if (count > 0 && !text.includes('import Image from "next/image"')) {
    text = text.replace(
      'import React, { useState } from "react";',
      'import React, { useState } from "react";\nimport Image from "next/image";',
    );
  }

  fs.writeFileSync("src/app/design-lab/page.tsx", text, "utf-8");
  console.log("Successfully replaced", count, "tags");
} catch (e) {
  console.error("ERROR:", e.message);
}
