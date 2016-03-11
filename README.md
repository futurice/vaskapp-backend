# Wappuapp backend

Dependencies:

* Node + npm
* Postgres
* Heroku toolbelt

Get started:

* `bash ./tools/reset-database.sh`
* `cp .env-sample .env`  
* `npm install`
* `knex migrate:latest`
* `knex seed:run`
* `npm start`
* Server runs at http://localhost:9000

Start using [API endpoints](#api-endpoints).

Production environment: https://wappuapp-backend.herokuapp.com

## Techstack

* Node.js express app
* Written in ES6
* Winston for logging
* Postgres

## Heroku env

```bash
#!/bin/bash
heroku addons:create --app wappuapp-backend papertrail
heroku addons:create --app wappuapp-backend heroku-postgresql:hobby-dev
heroku addons:create --app wappuapp-backend newrelic
```

Add Postgis:

```bash
heroku pg:psql -a wappuapp-backend
create extension postgis;
```

## API Endpoints

### `GET /api/events`

> List events


Responses:

* `200 OK` List of [event objects](event-object)

## Response objects

### Event object

Example object:

```js
{
  "id": 1,
  "name": "Wappuinfo",
  "startTime": "2016-03-09T21:24:33Z",
  "endTime": "2016-03-10T00:00:00Z",
  "description": "Beer",
  "coverImage": "http://s3/path.jpg"
}
```

## Error handling

When HTTP status code is 400 or higher, response is in format:

```json
{
  "error": "Internal Server Error"
}
```
