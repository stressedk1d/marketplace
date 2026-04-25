# Demo Release Definition of Done

## 1) Backend API smoke

- [ ] `pytest backend/tests/test_api_smoke.py` passes.
- [ ] `GET /products` returns `200` and valid payload (`items`, `total`, `limit`, `offset`).
- [ ] `GET /brands` returns `200`.
- [ ] `GET /collections` returns `200`.
- [ ] `GET /orders/my` without token returns `401`.
- [ ] Auth -> cart -> checkout -> `GET /orders/my` flow returns `200` and at least one order.
- [ ] Edge checks pass:
  - [ ] `min_price > max_price` -> `400`
  - [ ] `limit=0` -> `400`
  - [ ] unknown `brand_slug` -> empty list with `200`

## 2) Critical user flows (manual)

- [ ] Catalog opens and filters/sorting work (brand, collection, price, sort).
- [ ] Product page opens without broken layout and gallery renders.
- [ ] Add to cart works from catalog and product page.
- [ ] Cart shows correct items and totals.
- [ ] Checkout creates order successfully.
- [ ] Orders page displays created order and statuses correctly.
- [ ] Wishlist add/remove works from catalog and product page.

## 3) Data and media integrity

- [ ] No critical 404 for product/brand images during main flows.
- [ ] Seeder run is idempotent in demo environment (no destructive surprises).
- [ ] No duplicate products in demo catalog for key brands.
- [ ] Core brands and collections expected for demo are present.

## 4) Quality gate

- [ ] Backend tests pass (`pytest backend/tests`).
- [ ] Frontend build passes (`npm run build` in `frontend`).
- [ ] No blocker-level console/runtime errors in demo flows.

## 5) Demo readiness

- [ ] Demo script (5-7 min) validated end-to-end once.
- [ ] One fallback path prepared (if AI search fails, use standard catalog flow).
- [ ] Known limitations are documented and non-blocking.
- [ ] Seed DB snapshot/source for demo is fixed and reproducible.
