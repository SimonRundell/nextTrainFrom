# Next Train From

A personal live UK rail departure board. Search by departure station, optionally filter to trains calling at a second station, and get real-time platform, timing, and status information powered by the [TransportAPI](https://developer.transportapi.com/).

**Live demo:** https://ntf.codemonkey.design/

---

## What it does

- Type three or more characters to search any UK rail station by name or CRS code.
- Optionally add a "Calling at" filter to show only trains that stop at a second station.
- Click any departure to expand full service details: journey info, scheduled vs expected times, platform, operator, and status.
- Responsive — works on phone, tablet, and desktop.

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd NextTrainFrom
npm install
```

### 2. Get a TransportAPI key

Register for a free account at [developer.transportapi.com](https://developer.transportapi.com/).  
The free tier gives 30 requests per day, which is plenty for personal use.

### 3. Create your config file

Copy the example config and fill in your credentials:

```bash
cp public/.config.example.json public/.config.json
```

Edit `public/.config.json`:

```json
{
  "app_id":  "your_app_id_here",
  "app_key": "your_app_key_here"
}
```

> **Note:** `public/.config.json` is in `.gitignore` so your credentials are never committed.

### 4. Run locally

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

Deploy the contents of `/dist` to any static host (Netlify, GitHub Pages, a plain web server, etc.).

---

## Project structure

```
src/
  App.jsx            # Root component – layout and train list
  StationSearch.jsx  # Reusable typeahead station picker
  data.js            # useTrainData hook – fetches from TransportAPI
  trainDetails.jsx   # Expandable service detail card
  icons.jsx          # Operator logos and emoji status icons
  cmFloatAd.jsx      # Floating attribution banner
  main.jsx           # React entry point
  index.css          # All styles

public/
  .config.json       # Your API credentials (git-ignored)
  .config.example.json
  stations.json      # Offline UK station list (name + CRS code)
  images/            # Operator logos
```

---

## Tech stack

| Layer       | Technology                               |
|-------------|------------------------------------------|
| Framework   | React 19 + Vite 7                        |
| UI          | Mantine 8                                |
| HTTP        | Axios                                    |
| Data source | TransportAPI v3 (live UK rail)           |
| Styling     | Plain CSS with PostCSS (Mantine preset)  |

---

## License

&copy; Simon Rundell, Dept of ITDD, Exeter College.  
Released under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/).

You are free to share and adapt this project for non-commercial purposes, provided you give appropriate credit and distribute any derivatives under the same licence.
