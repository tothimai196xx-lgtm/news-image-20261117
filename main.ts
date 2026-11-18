// Entry program for the make.fun news-image-20261117 competition.
//
// The entry image (entry.png, a JPEG in a .png name, as the rules allow)
// sits next to this file in the repository. This program copies it to the
// output directory make.fun provides, byte for byte, with no network and
// no other side effects. Standard library only.

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUTPUT_NAME = "entry.png";

// The repository root is the directory holding this file.
const repoRoot = dirname(fileURLToPath(import.meta.url));
const source = join(repoRoot, OUTPUT_NAME);
const destination = join(OUTPUT_DIR, OUTPUT_NAME);

if (!existsSync(source)) {
  throw new Error(`entry image not found next to main.ts: ${source}`);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(source, destination);

// Sanity-check the copy before reporting success: it must be a whole
// PNG or JPEG (checked by its first bytes) and at most 1 MiB, per the
// competition rules. A bad copy fails loudly instead of being judged.
const bytes = readFileSync(destination);
const isPng = bytes.subarray(0, 8).equals(
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
);
const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
if (!isPng && !isJpeg) {
  throw new Error(`output is neither PNG nor JPEG: ${destination}`);
}
const size = statSync(destination).size;
if (size > 1048576) {
  throw new Error(`output is ${size} bytes, over the 1 MiB limit`);
}
console.log(`Wrote ${destination} (${size} bytes, ${isPng ? "PNG" : "JPEG"})`);
