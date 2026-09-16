# YenceOfficial — John Clarence Layog

A personal programming and software development portfolio with a warm portrait, dark interface, interactive particles, scroll reveals, and a motion toggle. The layout adapts to phones, tablets, and desktop screens.

## Projects and features

- **Centrix Labs:** working project for uploading and releasing free apps. Payment integration and additional features remain in development. Project status was supplied by the owner; its production flows have not been independently tested.
- **Orbit:** create, complete, filter, and delete tasks with browser-local persistence.
- **Prism:** create gradients, change colors and angles, and copy or download the generated CSS.
- **Field Notes:** write Markdown, preview it, autosave in this browser, and download a Markdown file.
- **Tech stack:** web foundations used in this portfolio, plus a clearly labeled learning roadmap for web applications, software/data, and mobile development.
- **Creative coding playground:** interactive Orb, Wave, and Helix particle forms, adjustable energy, and color remixing.
- **Contact:** direct email and WhatsApp links.

## Edit the website

The source is plain HTML, CSS, and JavaScript. No package install or build step is needed. `dist/` contains the actual source files to edit and publish.

| File | Edit here |
| --- | --- |
| `dist/index.html` | Name, bio, projects, tech stack, contact links |
| `dist/styles.css` | Colors, typography, layout, responsive rules, animations |
| `dist/app.js` | Interactive demos, particle effects, UI behavior |
| `dist/logic.js` | Task helpers, gradient generation, safe Markdown rendering |
| `dist/assets/john-clarence-layog.jpg` | Portfolio portrait |
| `wrangler.jsonc` | Cloudflare Pages project name and publish directory |
| `DEPLOYMENT.md` | Initial GitHub and Cloudflare setup |

### From GitHub

After this source has been pushed to your repository, open the file you want to change in GitHub, choose **Edit**, make your changes, and **Commit changes**. With Cloudflare's Git integration configured, commits to `main` trigger a new production deployment. See the [Cloudflare Git integration documentation](https://developers.cloudflare.com/pages/get-started/git-integration/).

For larger edits, use a branch and pull request. You can edit these text files directly in the browser; no local installation is necessary for small changes.

### On your computer

From the repository root, serve the `dist` folder with Python:

```bash
python3 -m http.server 8000 --directory dist
```

On Windows with the Python launcher:

```powershell
py -m http.server 8000 --directory dist
```

Visit `http://localhost:8000`. Use a local web server because the JavaScript uses ES modules; opening `index.html` as a local file is not the supported way to run the demos. Stop the server with Ctrl+C.

With Node.js installed, check JavaScript syntax before committing:

```bash
node --check dist/app.js
node --check dist/logic.js
```

## Contact details

- Email: `mailto:Clarencedionisio23@gmail.com`
- WhatsApp: `https://wa.me/639502394858` (displayed as `09502394858`)
- Featured project: `https://centrix-labs.pages.dev/`

The email and WhatsApp links open the visitor's email app or WhatsApp handoff; they do not send a message automatically.

## Hosting

Prepared for Cloudflare Pages, with project name **`yenceofficial`**, production branch **`main`**, build command **`exit 0`**, and output directory **`dist`**. The requested destination is `https://yenceofficial.pages.dev`; the name and live deployment must be confirmed in Cloudflare. The configuration file alone does not reserve the address, connect GitHub, or deploy the website.

Use **Pages Git integration** for automatic updates from GitHub. Full setup: [DEPLOYMENT.md](DEPLOYMENT.md).

## Data and assets

Orbit tasks, notes, and motion preferences are stored in the visitor's browser. They are not synced across devices or visitors. Moving to a different hostname creates a separate browser-storage origin, so data from the old site does not automatically appear on the new one.

The portrait is the user-supplied photo. Google Fonts provides optional Manrope and DM Sans typefaces; local Arial and Georgia fallbacks are included. No analytics, backend, contact-form service, payments, or login system are added to this portfolio.

The original workspace's `.openai/hosting.json`, if present, is not required by Cloudflare and is excluded from the portable GitHub export.
