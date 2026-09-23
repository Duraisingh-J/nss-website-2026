# NSS Event Launch Page

Standalone React + Vite page for the NSS MIT Campus event.

## Flow

1. General NSS information is shown.
2. A countdown runs toward the configured event time.
3. When the countdown reaches zero, `BEGIN NSS EXPERIENCE` appears.
4. Clicking the button plays `public/video/nss-intro.mp4`.
5. When the video finishes, the browser redirects to the configured main NSS website.

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown by Vite (normally `http://localhost:5173`).

## Change the event time

Open:

`src/App.jsx`

At the top, change only:

```js
targetDateTime: "2026-10-02T10:00:00+05:30",
```

The `+05:30` is India Standard Time.

If the event is delayed, change this value and save the file. Vite's development server will hot-reload the local page and the countdown will use the new target.

## Change the main NSS website

In the same `CONFIG` object:

```js
mainWebsiteUrl: "https://YOUR-MAIN-NSS-WEBSITE-URL.com",
```

Replace it with the real production NSS website URL.

## Video

The supplied intro video is stored at:

`public/video/nss-intro.mp4`

Do not move or rename it unless you also update `videoPath` in `src/App.jsx`.

## Build

```bash
npm run build
npm run preview
```
