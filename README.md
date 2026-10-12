# Next Train From

A personal live UK rail departure board. Search by departure station, optionally filter to trains calling at a second station, and get real-time platform, timing, and status information powered by National Rail's Darwin feed, via the Live Departure Boards Staff Web Service (LDBSVWS) on the [Rail Data Marketplace](https://raildata.org.uk).

**Live demo:** https://ntf.codemonkey.design/

---

## What it does

- Type three or more characters to search any UK rail station by name or CRS code.
- Optionally add a "Calling at" filter to show only trains that stop at a second station.
- Click any departure to expand full service details: journey info, scheduled vs expected times, platform, operator, and status.
- Responsive — works on phone, tablet, and desktop.

---

## Architecture

The Rail Data Marketplace API key must never reach the browser, so a small PHP backend in `/api` calls Darwin server-side and the React frontend only ever talks to that backend. This is no longer a pure static site — it needs a PHP host (DreamHost, in production).

```
React (Vite) ──axios──▶ /api/departures.php ──cURL + x-apikey──▶ Rail Data Marketplace (LDBSVWS)
```

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd NextTrainFrom
npm install
```

### 2. Get a Rail Data Marketplace API key

Register for a free account at [raildata.org.uk](https://raildata.org.uk) and subscribe to the "Live Departure Board - Staff Version" API product. Authentication is a single `x-apikey` header — check the product's "Try it" panel to confirm which issued credential (typically the Consumer key) is the value that belongs there.

### 3. Create your config file

Copy the example config and fill in your credentials:

```bash
cp .config.example.json .config.json
```

Edit `.config.json`:

```json
{
  "darwin": {
    "apiKey": "your_api_key_here",
    "endpoint": "https://api1.raildata.org.uk/1010-live-departure-board---staff-version1_0/LDBSVWS/api/20220120"
  },
  "cacheSeconds": 30,
  "allowedOrigins": ["https://ntf.codemonkey.design"],
  "devApiBase": "http://localhost/api"
}
```

`devApiBase` is the only place the frontend's API base URL is configured — `vite.config.js` reads it at dev-server start and injects it into the bundle, since Vite and the PHP API run on different ports locally. There's no separate `.env` file. Production builds always ignore it and use a relative path, since the built app and `/api` share an origin once deployed.

> **Note:** `.config.json` is in `.gitignore` so your credentials are never committed. It must sit at the project root (next to `/api`, `index.html`), not inside `public/` — the old TransportAPI setup kept credentials in `public/.config.json` because they were safe to expose to the browser; the Darwin API key is not.

### 4. Serve the API locally

Either use Laragon (Apache on `http://localhost/`, project reachable as `/NextTrainFrom/`), or for a quick test:

```bash
php -S localhost:8081 -t .
```

### 5. Run the frontend

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Build and deploy

```bash
npm run build        # outputs to /dist
npm run preview      # preview the production build locally
```

**DreamHost (or any PHP host)**

1. `npm run build`.
2. Upload the contents of `dist/` to the web root, plus `api/`, `.htaccess` and `.config.json`. Set `allowedOrigins` in `.config.json` to the production origin.
3. Make sure `api/cache/` is writable.
4. Check `/api/health.php` and `/api/departures.php?from=EXD`, and that `/.config.json` returns 403 or 404.

DreamHost serves PHP via FastCGI/PHP-FPM, not mod_php — `.htaccess` here has no `php_flag`/`php_value` directives, just mod_rewrite and header rules, so it's safe there.

---

## Project structure

```
api/
  cors.php                shared CORS, included first in every endpoint
  config.php               loads and validates .config.json
  ldbws.php                 Darwin LDBSVWS REST client
  normalise.php            Darwin JSON -> the response shape the frontend expects
  cache.php                tiny file cache with TTL
  departures.php           GET ?from=EXD&callingAt=PLY
  health.php                GET basic status for monitoring
  cache/                    runtime cache files (not web readable)

src/
  App.jsx             # Root component – layout and train list
  StationSearch.jsx   # Reusable typeahead station picker
  api/client.js       # Axios instance and fetchDepartures()
  data.js             # useTrainData hook – fetches from our own /api
  trainDetails.jsx    # Expandable service detail card
  icons.jsx           # Operator logos and emoji status icons
  cmFloatAd.jsx        # Floating attribution banner
  main.jsx             # React entry point
  index.css             # All styles

public/
  stations.json        # Offline UK station list (name + CRS code), for the typeahead
  images/               # Operator logos

.config.json            # Darwin API key + settings (git-ignored)
.config.example.json
.htaccess                # root rewrite rules and .config.json block
```

---

## Tech stack

| Layer       | Technology                               |
|-------------|-------------------------------------------|
| Frontend    | React 19 + Vite 7                         |
| UI          | Mantine 8                                 |
| HTTP        | Axios                                      |
| Backend     | PHP (cURL), no framework                  |
| Data source | National Rail Darwin via LDBSVWS (Rail Data Marketplace) |
| Styling     | Plain CSS with PostCSS (Mantine preset)   |

---

## Licence

Train running information is provided by National Rail Enquiries (www.nationalrail.co.uk) via the Darwin Live Departure Boards feed. This project is not affiliated with or endorsed by National Rail.

&copy; Simon Rundell, Dept of Cybersecurity and Digital Technologies, Exeter College.
Released under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/).

You are free to share and adapt this project for non-commercial purposes, provided you give appropriate credit and distribute any derivatives under the same licence.
