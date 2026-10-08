# Travlr Getaways — Module Six

## Setup
Use Node.js 20.19 or later (Node 22 LTS recommended for the supplied dependency versions). Start MongoDB locally, then from this folder run:

```sh
npm ci
npm run seed
npm start
```

`npm run seed` deletes and replaces the trips in the course development database. Use it only against your development database. The default database is `mongodb://127.0.0.1/travlr`; set MONGODB_URI to override it.

Open http://localhost:3000/travel. Both /travel and /travel.html render trips received from the API. Optional API_BASE_URL defaults to http://127.0.0.1:3000/api/ (uses PORT when set).

## Separation of concerns
- app_api/models: database connection, Mongoose trip schema, seed script.
- app_api/controllers/trips.js: Mongoose trip queries and CRUD JSON responses.
- app_api/routes: GET /api/trips, GET /api/trips/:tripCode, POST /api/trips, PUT /api/trips/:tripCode, and DELETE /api/trips/:tripCode.
- app_server/controllers/traveler.js: fetch request to API, JSON processing, Handlebars rendering.
- data/trips.json: seed data, included in this ZIP.

The canonical prefix is /api. Express's default case-insensitive routing also accepts /API.
The trip collection returns an array with HTTP 200. The single-trip GET returns an array containing its matching record to preserve the Module Five response format. POST returns 201; duplicate codes return 409. PUT updates editable details using the trip code in the URL and returns 200. DELETE returns 200 with a confirmation message. Unknown codes/endpoints return 404, invalid input returns 400, and database failures return 500 with a JSON message. Trip codes are unique and remain unchanged during edits.

## Angular administrator SPA

The Angular CLI application is in `app_admin/`. It contains a reusable `TripCardComponent`, a trip list and add/edit form, and `TripService` methods for GET, POST, PUT, and DELETE. Bootstrap styles are included in the Angular build. To run both applications for development, open two terminals:

1. In this project folder, run `npm install`, start MongoDB, run `npm run seed` for the development database, and run `npm start`.
2. In `app_admin/`, run `npm install` and `npm start`. Open `http://localhost:4200/` to test the admin SPA. Its proxy sends `/api` and `/images` requests to Express at port 3000.
3. To serve the compiled SPA from Express, run `npm --prefix app_admin run build` or `npm run build:admin`, then open `http://localhost:3000/admin/`.

The Angular service tests use mocked HTTP requests. Run them with `npm --prefix app_admin test` in an environment with Chrome installed. The Express controller tests run with `npm test`. Use Postman against `http://localhost:3000/api/trips` to verify each method; create a test trip before testing PUT and DELETE, then confirm that the same new or updated trip appears at `/travel`.

## Testing in Postman — required before submission
1. Import `postman/Travlr_Module6.postman_collection.json`.
2. With MongoDB running and seeded, run GET All trips and GET One trip. Then run Create trip, Update trip, and Delete trip in that order. The create request saves `MOD6DEMO` as a collection variable for update and delete.
3. Use the returned statuses and trip data to verify the API. Refresh `/admin/` and `/travel` after creating or updating a trip to verify that both clients use the same database records.
4. Stop MongoDB only if you want to run the final database-unavailable request; restart it afterward. Save the required screenshots from the browser after you add and update a trip. These live Postman and browser checks have not been run in this environment.

## Checks completed in this environment
The controller tests exercise mock Mongoose queries and a mocked API fetch. These checks do not validate a live MongoDB connection or replace Postman tests. Run `npm test` and the Angular service tests after dependencies are installed.

## GitHub module6 branch
The supplied ZIP does not contain Git metadata. Apply these files to your existing local repository and keep its `.git` folder. From the repository root:

```sh
git switch -c module6
git add .
git commit -m "Add Angular admin trip management"
git push -u origin module6
```

If `module6` already exists, use `git switch module6`. Push from the existing local repository after copying these updates; this ZIP has no repository credentials or remote configuration.

## AI assistance acknowledgment
OpenAI ChatGPT assisted with API refactoring, error handling, and test preparation. Review the code, perform the live Postman tests, and follow your course's citation requirements.

When copying into your existing repository, preserve your `.git` folder and merge the updated files into the existing Module Five project.
