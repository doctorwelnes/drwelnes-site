const fs = require("fs");

let content = fs.readFileSync("src/app/design-lab/page.tsx", "utf-8");

content = content.replace(
  /<img\s+src={([^}]+)}\s+className=("[^"]+")\s*\/>/g,
  '<Image src={$1} width={800} height={800} alt="" className=$2 />',
);
content = content.replace(
  /<img\s+src={([^}]+)}\s+className=("[^"]+")\s+alt=("[^"]+")\s*\/>/g,
  "<Image src={$1} width={800} height={800} alt=$3 className=$2 />",
);

if (!content.includes('import Image from "next/image"')) {
  content = content.replace(
    'import React, { useState } from "react";',
    'import React, { useState } from "react";\nimport Image from "next/image";',
  );
}

fs.writeFileSync("src/app/design-lab/page.tsx", content, "utf-8");
console.log("Replaced all img tags with Image in design-lab/page.tsx");
