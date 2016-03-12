[![Build Status](https://travis-ci.com/futurice/wappuapp-backend.svg?token=yjocXfDrdDpDqbwnbBG7&branch=master)](https://travis-ci.com/futurice/wappuapp-backend)

# Wappuapp backend

Dependencies:

* Node + npm
* Postgres
* Heroku toolbelt

Get started:

* `bash ./tools/reset-database.sh`
* `cp .env-sample .env`  
* `source .env`

  Or use [autoenv](https://github.com/kennethreitz/autoenv).

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


### `GET /api/teams`

> List all teams

Responses:

* `200 OK` List of [team objects](team-object)


### `POST /api/actions`

> Create a new action

Body is one of [action objects](#action-objects).

Responses:

* `200 OK`

### `POST /api/users`

> Create a new user

Body is one of [user object](#user-object).

Responses:

* `200 OK`

### `GET /api/action_types`

> List action types available

Body is one of [action type object](#action-type-object).

Responses:

* `200 OK`


### `GET /api/feed`

> Get list of feed

Body is one of [one of feed objects](#feed-objects).

Responses:

* `200 OK`


## Response objects

### Event object

```js
{
  "name": "Akateeminen Herwannan vahvin mies 2016",
  "locationName": "Tietotalon edusta",
  "startTime": "2016-04-20T09:00:00.000Z",
  "endTime": "2016-04-20T14:00:00.000Z",
  "description": "Steong man competition",
  "organizer": "Herwannan hauiskääntö",
  "contactDetails": "Herwannan hauiskääntö / hkaanto@tut.fi",
  "teemu": false,
  "location": {
    "latitude": 61.449605,
    "longitude": 23.857158
  },
  "coverImage": "https://storage.googleapis.com/wappuapp/assets/herwannan-vahvin-mies.jpg"
}
```

### Team object

```js
{
  "id": 1,
  "name": "Tietoteekkarikilta"
}
```

### User object

```js
{
  "uuid": "de305d54-75b4-431b-adb2-eb6b9e546014",
  "name": "Hessu Kypärä"
}
```

### Action type object

```js
{
  "id": "3",
  "code": "CIDER",
  "name": "Grab a cider",
  "value": 10,
  "cooldown": 300000
}
```

### Action objects

#### Basic action object

`type` is one of `BEER`, `CIDER`.

```js
{
  location: {
    latitude: -1.2345,
    longitude: 56.2322
  },
  type: "BEER",
  team: 1,
  user: 'UUID'
}
```

#### Image action object

```js
{
  location: {
    latitude: -1.2345,
    longitude: 56.2322
  },
  type: "IMAGE",
  team: 1,
  imageData: 'base64encodedimage',
  user: 'UUID'
}
```


### Feed objects

#### Image feed object

```js
{
  location: {
    latitude: -1.2345,
    longitude: 56.2322
  },
  type: "IMAGE",
  createdAt: "2016-04-20T09:00:00.000Z",
  author: {
    "name": "Nahkasimo",
    "team": "Sähkökilta"
  },
  url: "https://storage.googleapis.com/wappuapp/user_content/123.jpg"
}
```


## Error handling

When HTTP status code is 400 or higher, response is in format:

```json
{
  "error": "Internal Server Error"
}
```
