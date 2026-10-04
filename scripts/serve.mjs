import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../_site/", import.meta.url));
const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "127.0.0.1";
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};
await stat(root);
const server = http.createServer(async (request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405);
    response.end();
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (pathname.includes("\\") || pathname.includes("\0")) throw new Error("Invalid path");
    let filename = path.resolve(root, `.${pathname}`);
    const relative = path.relative(root, filename);
    if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Invalid path");
    let metadata = await stat(filename);
    if (metadata.isDirectory()) {
      if (!pathname.endsWith("/")) {
        response.writeHead(301, { Location: `${pathname}/${new URL(request.url, "http://localhost").search}` });
        response.end();
        return;
      }
      filename = path.join(filename, "index.html");
      metadata = await stat(filename);
    }
    const content = await readFile(filename);
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filename)] || "application/octet-stream",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Content-Length": metadata.size,
    });
    response.end(request.method === "HEAD" ? undefined : content);
  } catch {
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    response.end(request.method === "HEAD" ? undefined : await readFile(path.join(root, "404.html")));
  }
});
server.listen(port, host, () => console.log(`Academic homepage preview: http://${host}:${port}`));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(() => process.exit(0)));
