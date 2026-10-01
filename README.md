# Travlr — Module Five

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
- app_api/controllers/trips.js: Mongoose find queries and JSON responses.
- app_api/routes: GET /api/trips and GET /api/trips/:tripCode.
- app_server/controllers/traveler.js: fetch request to API, JSON processing, Handlebars rendering.
- data/trips.json: seed data, included in this ZIP.

The canonical prefix is /api. Express's default case-insensitive routing also accepts /API.
All trips return an array with HTTP 200. One trip returns an array containing its matching record with HTTP 200, as shown in the Module Five guide. Unknown codes/endpoints return 404, invalid code characters return 400, and database query failures return 500 with a JSON message.

## Testing in Postman — required before submission
1. Import postman/Travlr_Module5.postman_collection.json.
2. With MongoDB running and seeded, run the first five requests. Their assertions verify status and JSON shape.
3. Stop MongoDB and run the final database-unavailable request; expect 500. Restart MongoDB afterward.
4. Save screenshots or results as required by your instructor. These Postman checks have been provided but have NOT been executed here.

## Checks completed in this environment
Eight checks in `npm test` exercise controllers with mocked Mongoose queries and a real local HTTP fixture for the website-to-API request. These checks do not validate a live MongoDB connection or replace Postman tests. MongoDB/Postman are unavailable here, and dependency installation could not finish because required packages were not cached. Full application startup remains to be checked on your computer.

## GitHub module5 branch
Apply these files to your existing local repository; keep its .git folder. From the repository root:

```sh
git switch -c module5
git add .
git commit -m "Separate trip REST API and connect travel page"
git push -u origin module5
```

If module5 already exists, use `git switch module5`. The GitHub push has not been performed here because this ZIP has no repository credentials or remote configuration.

## AI assistance acknowledgment
OpenAI ChatGPT assisted with API refactoring, error handling, and test preparation. Review the code, perform the live Postman tests, and follow your course's citation requirements.

## Guide review
Aligned with supplied guide pages 104–117: API structure, find queries, tripCode route, array responses, image links to individual-trip API, and built-in fetch. Reviewed the remaining Module Five pages 113–117, including fetch processing, empty/invalid response messages, and Git commands.

When copying into your existing repository, remove the old app_server/models folder after confirming that app_api/models is present; database access has moved to app_api.
