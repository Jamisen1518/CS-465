# Travlr Getaways

## Project overview

Travlr Getaways is a full stack travel application built for CS 465. It includes a public customer-facing website and an administrative single-page application (SPA). The public site displays trip information, while the admin side lets an authorized user manage trip records.

### Technologies

- **MongoDB and Mongoose** store and retrieve trip and user records.
- **Node.js and Express** provide the server and REST API.
- **Handlebars** renders the public Express website.
- **Angular** powers the administrative SPA.
- **JSON Web Tokens (JWT)** support authenticated access to protected admin operations.

## Running the application

The exact commands depend on the folder and scripts in the submitted project. From the project directory:

1. Install the dependencies for the server/API and Angular admin application.
2. Configure the MongoDB connection and any authentication settings using the project's environment configuration. Do not commit real credentials or signing secrets.
3. Start the Express server and the Angular admin application using the scripts provided in their respective `package.json` files.
4. Open the local public site and admin application in a browser. Use a registered admin account to sign in.

The API is organized under the `/api` path. Check the project configuration for the local server port and Angular proxy settings.

## Architecture

The project uses three related frontend approaches. The public website is rendered by Express with Handlebars. The server sends finished HTML pages to the browser, which works well for page-based navigation and keeps the templates close to the server routes. JavaScript adds behavior in the browser, such as responding to user actions and working with data returned by the API. The Angular admin SPA loads an application shell and updates its views as the administrator moves between screens, without reloading a complete page for every action. Angular components and services also help organize the admin interface and its API calls.

The backend uses MongoDB because trip and user records are document-shaped data that can be represented naturally as JSON-like documents. MongoDB works with changing application data, and Mongoose provides schemas, validation, and query methods such as `.find()`. This allowed the application to retrieve and manage trips without mapping the records into fixed relational tables.

## Functionality

JSON is a text format for representing data with objects, arrays, strings, numbers, booleans, and null values. JavaScript is a programming language that can create, read, and manipulate JSON data, but the two are different: JSON does not contain executable code or JavaScript-specific values such as functions. In this application, the API sends and receives trip and user data as JSON. The Angular frontend can parse those responses and display them, while Express and Mongoose process requests and return the resulting records in JSON.

During development, static trip information was replaced with data retrieved through Mongoose from MongoDB. API routes and controller logic were organized under `app_api`, which gave the public site and admin SPA a consistent way to retrieve or change trip data. The Angular admin interface also uses reusable components, including trip cards and shared form/interface pieces. Reusing components reduces repeated markup and logic, keeps the interface consistent, and makes later changes easier to apply in one place.

## Testing

HTTP methods describe the action a client wants the server to perform. In this project, **GET** retrieves trip data, **POST** creates a trip, **PUT** updates a trip, and **DELETE** removes a trip. An endpoint is a specific API route, such as the route used to retrieve all trips or the route used to access one trip by its identifier. The frontend calls these endpoints, and the server returns a status code and, when appropriate, a JSON response.

API testing with tools such as Postman checks that each method reaches the right endpoint, returns the expected data, and handles invalid requests appropriately. Testing became more involved after authentication was added because protected endpoints require a valid JWT. A request without a token or with an invalid token should be denied; an authenticated request should be allowed to perform the operation permitted by that endpoint. This helped verify both normal API behavior and the access controls around trip administration.

## Reflection

This course helped me connect the different parts of a full stack application, from the browser interface to server routes, API controllers, and database operations. I developed more experience with Express, Angular, MongoDB, Mongoose, JSON, REST methods, and JWT authentication. I also practiced testing API requests, troubleshooting application structure, and documenting a working project.

These skills support my goal of pursuing work in computer science and information security. Understanding how an application handles data and protects administrative functions gives me a stronger foundation for entry-level technical and cybersecurity roles. Completing the project also gave me a portfolio example that demonstrates how I can learn a technology stack, connect its parts, and explain the decisions behind my work.

## AI use acknowledgment

I used generative AI to help organize and draft portions of this README. I reviewed and edited the content to reflect my project and understanding.
