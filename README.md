# Shapes Tracker London

A community-based stock tracker for Arnott's Shapes biscuits at Waitrose and
Morrisons stores in London. Vibe coded with love ❤️.

## How it works

- Click a Waitrose or Morrisons marker on the London map.
- Select which Arnott's Shapes flavours are in stock: Chicken, BBQ, and/or Pizza.
- Log the selected flavours as available at that store.
- A store appears in stock when any supported flavour has a log from the last 24 hours.
- Clicking a store shows all recently logged flavours available there.

Logs are stored in the browser with `localStorage`, so this prototype works
without a backend.

## Run it

Open `index.html` in a browser.

For the map tiles and Leaflet library to load, the browser needs internet access.

## Next production steps

- Replace the seeded store list with official supermarket location data.
- Add accounts or moderation if public submissions need trust controls.
- Move logs from `localStorage` to a shared backend database.
- Add product autocomplete and duplicate/spam protection.
