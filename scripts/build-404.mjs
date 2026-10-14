import { readFileSync, writeFileSync } from "node:fs"

const [src, dest] = process.argv.slice(2)
if (!src || !dest) {
  console.error("usage: node scripts/build-404.mjs <app-index.html> <out-404.html>")
  process.exit(1)
}

const appBase = process.env.APP_BASE ?? "/sarashina-mercury/app/"
const siteBase = process.env.SITE_BASE ?? "/sarashina-mercury/"

const guard = `<script>if(!location.pathname.startsWith(${JSON.stringify(
  appBase
)}))location.replace(${JSON.stringify(siteBase)});</script>`

const html = readFileSync(src, "utf8")
writeFileSync(dest, html.replace("</head>", `${guard}</head>`))
console.log(`wrote ${dest}`)
