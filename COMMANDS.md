# salsaheb.sh /tools — cheatsheet for editing this site

Personal pentest command & payload reference. Sibling of the main portfolio,
same `saleh.sh` design system. Single page, live search, copy-on-click.

## Locations

| What | Where |
|------|-------|
| Local repo (edit here) | `~/dev/saleh-tools` |
| GitHub | https://github.com/Salsaheb4/saleh-tools (branch `main`) |
| Live URL | https://tools.salsaheb.pages.dev |
| Cloudflare project | `salsaheb` (SHARED with the main site) — this site is the **`tools` branch alias** |

## Deploy (the one command)

```bash
cd ~/dev/saleh-tools
npm run build && npx wrangler pages deploy dist --project-name salsaheb --branch tools
```

> ⚠️ **CRITICAL:** always use `--branch tools`. The `salsaheb` Cloudflare project is
> shared with the portfolio site. `--branch main` = the portfolio (salsaheb.pages.dev);
> `--branch tools` = this site (tools.salsaheb.pages.dev). Deploying the wrong dist to
> `main` would overwrite the portfolio.

Full commit + push + deploy:

```bash
cd ~/dev/saleh-tools
# edit src/data/tools.ts
npm run build
git add -A && git commit -m "..." && git push origin main
npx wrangler pages deploy dist --project-name salsaheb --branch tools
```

Dev preview: `npm run dev` → http://localhost:4321

## Add a new tool / payload

Everything lives in **`src/data/tools.ts`**. Append an object to the `tools` array:

```ts
{
  category: 'linux',                 // must match a Category id: nmap | fuzz | web | linux
  title: 'Short title',
  cmd: 'the command with <ip>',      // <angle> tokens render as amber placeholders
  desc: 'One-line what/why.',        // optional
  tags: ['tag1', 'tag2'],            // optional — searchable
  note: 'Gotcha or tip.',            // optional — amber callout
  ref: { label: 'GTFOBins ↗', url: 'https://gtfobins.github.io/' }, // optional
  kind: 'cmd',                       // 'cmd' (default) or 'payload'
},
```

- **`kind: 'cmd'`** — `<ip>`, `<domain>`, `<ports>` etc. are highlighted amber as placeholders.
- **`kind: 'payload'`** — shown literally. Use for XSS / SQLi where `<` and `>` are real
  characters (e.g. `<script>alert(1)</script>`), so they are NOT treated as placeholders.

Search indexes title + cmd + desc + tags + note + category automatically — no extra work.

## Add a whole new category

1. Add to `categories` in `src/data/tools.ts`, e.g. `{ id: 'ad', label: 'Active Directory', blurb: '...' }`.
2. Add tools with `category: 'ad'`.
   The nav rail, section, and search pick it up automatically.

## Structure

| File | Purpose |
|------|---------|
| `src/data/tools.ts` | ALL content — categories + tools. This is what you edit. |
| `src/pages/index.astro` | Single page: header, search, sections, cards + the search/copy JS. |
| `src/layouts/Base.astro` | HTML shell, fonts, meta. |
| `src/styles/global.css` | `saleh.sh` design system + tool-card / search / copy styles. |
| `public/favicon.svg` | Terminal `>_` mark. |
