const fs = require("fs");

let text = fs.readFileSync("src/app/design-lab/page.tsx", "utf-8");

let parts = text.split("<img");
for (let i = 1; i < parts.length; i++) {
  let index = parts[i].indexOf("/>");
  if (index !== -1) {
    let inner = parts[i].substring(0, index);
    let rest = parts[i].substring(index + 2);
    let newInner = inner.replace(/alt="[^"]*"/g, "").trim();
    parts[i] = `<Image width={800} height={800} alt="image" ${newInner} />` + rest;
  } else {
    // if not closed with />, restore '<img'
    parts[i] = "<img" + parts[i];
  }
}

// only join parts that were actually split properly
let newText = parts[0];
for (let i = 1; i < parts.length; i++) {
  if (parts[i].startsWith("<img")) {
    newText += parts[i];
  } else {
    newText += parts[i];
  }
}

if (!newText.includes('import Image from "next/image"')) {
  newText = newText.replace(
    'import React, { useState } from "react";',
    'import React, { useState } from "react";\nimport Image from "next/image";',
  );
}

fs.writeFileSync("src/app/design-lab/page.tsx", newText, "utf-8");
console.log("Processed", parts.length - 1, "tags");
