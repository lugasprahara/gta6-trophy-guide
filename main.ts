// Leonida Platinum Desk — the entry program for gta6-trophy-guide-01 (Node 22,
// standard library only). The guide itself is plain static files: app/index.html
// plus its CSS, JavaScript and data, with no build step, and it runs offline in a
// browser. This program hands the guide in: it copies app/ and screenshots/ from
// beside this file into the output directory and writes /output/dossier.json, the
// summary the judge reads (the screenshots, the first load's files and bytes, and
// the source), built with the vendored make.fun library.
//
// Leave vendor/makefun-frontend.ts alone: the scorer rebuilds dossier.json with
// its own copy of the library and requires the two to match byte for byte.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail loudly instead of handing in an empty guide: the app is nothing without
// its entry page, so check for it before copying anything.
const entryPage = join(repoRoot, 'app', 'index.html');
if (!existsSync(entryPage) || !statSync(entryPage).isFile()) {
  throw new Error(`entry page missing: expected a file at ${entryPage}`);
}

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps (from the kit's reference/gate.json): only
// text_max_bytes shapes the bytes; the other limits refuse an entry the scorer
// would refuse anyway (more than 4 screenshots or one over 256 KiB; more than
// 993 files and directories in app/ or 48 MiB of app files — app/ shares
// /output's own 1000-entry cap with screenshots/ and dossier.json).
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
