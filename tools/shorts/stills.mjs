// Render many stills with one bundle: node stills.mjs <outDir> <scale> <Comp:frame,frame,...> ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const [outDir, scale, ...jobs] = process.argv.slice(2);
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.resolve('shorts/src/index.ts')});
for (const job of jobs) {
  const [id, frames] = job.split(':');
  const composition = await selectComposition({serveUrl, id, browserExecutable});
  for (const f of frames.split(',').map(Number)) {
    await renderStill({composition, serveUrl, frame: f, output: path.join(outDir, `${id}_${f}.png`), scale: Number(scale), browserExecutable});
  }
  console.log('done', id);
}
