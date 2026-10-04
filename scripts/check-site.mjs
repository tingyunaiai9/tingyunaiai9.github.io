import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export async function checkBuiltSite(root) {
  const htmlFiles = [];
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.name.endsWith(".html")) htmlFiles.push(file);
    }
  }
  await walk(root);
  let checked = 0;
  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    const sourceURL = new URL(path.relative(root, file).replaceAll(path.sep, "/"), "http://site.local/");
    assert.doesNotMatch(html, /href=["']#["']/, `Placeholder link in ${file}`);
    assert.doesNotMatch(html, /(?:href|src)=["'](?:javascript:|data:text\/html)/i, `Executable URL in ${file}`);
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const target = new URL(match[1].replaceAll("&amp;", "&"), sourceURL);
      if (target.origin !== sourceURL.origin) continue;
      let destination = path.join(root, decodeURIComponent(target.pathname));
      try {
        if ((await stat(destination)).isDirectory()) destination = path.join(destination, "index.html");
        await stat(destination);
      } catch {
        assert.fail(`Broken local link in ${path.relative(root, file)}: ${match[1]}`);
      }
      if (target.hash && destination.endsWith(".html")) {
        const content = await readFile(destination, "utf8");
        const id = decodeURIComponent(target.hash.slice(1));
        assert.ok(content.includes(`id="${id}"`), `Missing anchor ${match[1]} in ${file}`);
      }
      checked++;
    }
  }
  return { pages: htmlFiles.length, links: checked };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await checkBuiltSite(fileURLToPath(new URL("../_site/", import.meta.url)));
  console.log(`Verified ${result.links} local links across ${result.pages} HTML pages`);
}
