# FitGirl Easy Downloader Web

A modern, frontend-only React (Next.js) web application designed to simplify the extraction and sequential downloading of game parts from `fitgirl-repacks.site` (targeting `fuckingfast.co` host links).

## Features

- **Automated Link Extraction:** Paste a FitGirl game URL and instantly extract all relevant multi-part links.
- **Sequential Native Downloads:** Handoffs download tasks natively to your browser one by one, bypassing JavaScript RAM limitations.
- **Intelligent Delays:** Integrates customized cooldown timers (10 seconds) between file hand-offs to prevent modern browsers from blocking rapid consecutive downloads.
- **Beautiful UI:** Built with Tailwind CSS, Lucide React icons, seamless Dark/Light mode support, and an integrated activity log.

## Getting Started

1. **Install dependencies:**
```bash
npm install
```

2. **Run the development server:**
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

Since this app relies on client-side fetching with a fallback public CORS proxy (`corsproxy.io`) to scrape HTML, it is configured for a static export in `next.config.mjs` (`output: "export"`). 

To deploy (e.g., to GitHub Pages):
```bash
npm run build
```
This will generate an `out/` folder containing pure HTML, CSS, and JS that you can host absolutely anywhere with zero backend required.

## Disclaimer
This project is an independent tool built for educational purposes and personal convenience. This tool is created for educational purposes and ethical use only. Any misuse of this tool for malicious purposes is not condoned. The developers of this tool are not responsible for any illegal or unethical activities carried out using this tool.
We do not host any files and only parse openly accessible URLs.