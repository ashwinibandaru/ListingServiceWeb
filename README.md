# Haven listing search

Angular frontend for the ListingSearch API. The UI sends filters and page navigation to `GET /api/Search`; the backend supplies the relevance score and paged results.

## Run locally

Requirements: Node.js 22.22.3 or later and npm 8 or later.

1. Start the backend at `https://localhost:7075`.
2. Run `npm install`.
3. Run `npm start` and open `http://localhost:4200`.

The Angular development server forwards `/api` requests to the backend using `proxy.conf.json`. The proxy accepts the backend's local development certificate. For a deployed frontend, configure the frontend host or reverse proxy to forward `/api` to the backend.

## Search behavior

The search form supports city, description keyword, minimum/maximum price, minimum bedrooms, target budget, and page size (1–100). Invalid price ranges, negative values, and invalid page sizes are blocked before making a request. Page navigation retains the backend's relevance-ranked results, and the returned score is shown alongside each listing.

City filtering uses the listing's dedicated `city` field rather than attempting to match a city name inside the street address. The backend model exposes that field from `sample_listings.json`, and the UI also displays it with each listing.

The backend ranks matches with a weighted budget-proximity and recency score. Budget proximity is `1 - min(abs(price - targetBudget) / targetBudget, 1)` when a positive target budget is supplied (otherwise it defaults to 0.5). Recency is `1 - min(daysSinceListed / maxRecencyDays, 1)`, with future listing dates treated as today. The defaults weight budget at 0.6, recency at 0.4, and use a 365-day recency window. The API sorts by descending score, then newest listing date; the frontend displays the returned score and preserves that ordering across pages.

## Commands

- `npm run build` — production build in `dist/listing-search-web`.
- `npm test -- --watch=false --browsers=ChromeHeadless` — run unit tests.
