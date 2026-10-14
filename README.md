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

The backend is responsible for matching and ranking: it receives `targetBudget` and returns scored listings ordered by relevance. The UI displays that score and labels its budget/recency context without reimplementing backend ranking logic.

## Commands

- `npm run build` — production build in `dist/listing-search-web`.
- `npm test -- --watch=false --browsers=ChromeHeadless` — run unit tests.
