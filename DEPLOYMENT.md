# Publish YenceOfficial on Cloudflare Pages

Prepared for John Clarence Layog's existing **`ClrncPrime/YenceOfficial`** GitHub repository shown in the supplied screenshot. Keep the repository private. A public Pages website does not require making the source repository public.

The requested hostname is **`yenceofficial.pages.dev`**. It is a target until Cloudflare confirms the project name and successfully deploys it. Do not delete the existing website before the replacement is working.

## 1. Put this source in GitHub

The repository root must contain `dist/`, `wrangler.jsonc`, and this guide. Keep the folder structure intact. The portrait belongs at `dist/assets/john-clarence-layog.jpg`.

If you downloaded a source ZIP, extract it first; committing the ZIP itself does not publish its contents.

For an empty GitHub repository, run these commands in the extracted source directory after signing into GitHub with your normal Git client:

```bash
git init -b main
git add .
git commit -m "Create YenceOfficial developer portfolio"
git remote add origin https://github.com/ClrncPrime/YenceOfficial.git
git push -u origin main
```

If the repository already contains commits, clone it and copy these source files into the clone, review the changes, then commit and push. Do not force-push over existing work. Do not upload access tokens or local credential files.

## 2. Create a Git-connected Pages project

1. In your Cloudflare account, open **Workers & Pages**.
2. Choose **Create application → Pages → Connect to Git**. Use the Pages flow for a `pages.dev` address.
3. Authorize the Cloudflare GitHub integration to access **`ClrncPrime/YenceOfficial`**, then select that repository.
4. Enter the settings below and deploy.

| Cloudflare setting | Value |
| --- | --- |
| Project name | `yenceofficial` |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `exit 0` |
| Build output directory | `dist` |
| Root directory | Leave empty: repository root |
| Environment variables | None required |

These are a static site's build settings; no framework compilation is needed. See [Cloudflare's static HTML guide](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/) and [build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/).

Start with **Git integration**. Cloudflare does not currently let a Direct Upload project switch to Git integration afterward, so the Git flow is the appropriate setup for future repository edits. See [Cloudflare's Git integration guide](https://developers.cloudflare.com/pages/get-started/git-integration/).

`wrangler.jsonc` defines only this portfolio's name, static output folder, and compatibility date. It does not bind or alter Centrix Labs, D1 databases, or other applications. See [Wrangler configuration for Pages](https://developers.cloudflare.com/pages/functions/wrangler-configuration/).

If Cloudflare reports that the requested name is unavailable or suggests a different hostname, review that result before proceeding. Do not assume a successful deployment has the exact requested address; use the URL Cloudflare actually returns.

## 3. Confirm the deployment

Wait for a successful production deployment and open its returned URL. Confirm:

- The portrait, styles, and particle playground load.
- The navigation opens Projects, About, Tech stack, Playground, and Contact.
- Orbit, Prism, and Field Notes open and respond.
- Centrix Labs opens its existing website.
- Email opens `Clarencedionisio23@gmail.com`; WhatsApp opens `639502394858`.
- The tech stack and text remain readable on a phone.

Do not send a real email or WhatsApp message just to test the destination.

## 4. Update from anywhere

Edit a file in GitHub and commit the change to `main`. Once Git integration is active, Cloudflare creates a new deployment automatically. The production website keeps the same address. Other branches can use preview deployments before merging into `main`.

To undo a change, revert the commit in GitHub and let Cloudflare redeploy. The Git history keeps your earlier versions available.
