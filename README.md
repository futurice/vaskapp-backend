[![Build Status](https://travis-ci.com/futurice/wappuapp-backend.svg?token=yjocXfDrdDpDqbwnbBG7&branch=master)](https://travis-ci.com/futurice/wappuapp-backend)

# Wappuapp backend

Dependencies:

* Node 4.x or 5.x + npm 2.x

 *Use NPM 2*.x, the current Babel configuration has issues with NPM 3.x and doesn't work ~~properly~~ at all with it

* Postgres with PostGis extension

  [Postgres.app](http://postgresapp.com/) has a built-in support.

  **Note: The command below has been done already for wappuapp-backend app. It is
  only useful if you create a new Heroku app.**

  You can add Postgis support to Heroku Postgres with:
  ```
  heroku pg:psql -a wappuapp-backend
  create extension postgis;
  ```

* Heroku toolbelt

## Get started

* `bash ./tools/reset-database.sh`

  If this doesn't work, you can manually run SQL commands from ./tools/init-database.sql
  in Postgres console.

* `cp .env-sample .env && cp .env-test-sample .env-test`
* Fill in the blanks in `.env` and `.env-test` files

  Ask details from Kimmo Brunfeldt or Tomi Turtiainen.

* `source .env` or `bash .env`

  Or use [autoenv](https://github.com/kennethreitz/autoenv).

* `npm install`
* `npm install -g knex`
* `knex migrate:latest` Run migrations to local database
* `knex seed:run` Create seed data to local database
* `npm start` Start express server locally
* Server runs at http://localhost:9000

Start using [API endpoints](#api-endpoints).

Environments:

* `qa` https://wappuapp-backend-qa.herokuapp.com
* `prod` https://wappuapp-backend.herokuapp.com

## Techstack

* Node.js express app. Architecture explained here https://github.com/kimmobrunfeldt/express-example/
* Written in ES6
* Winston for logging
* Postgres

## Heroku/Cloud env

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

Google Cloud Storage is used for storing images.

## Common tasks

### Release

Migrations and seeds are automatically run in Heroku when you deploy via git push.
Migrations are run if knex detects new files in migrations directory.
Seeds must be replayable, they must be upsert operations so they can be run
on each push.

1. Commit changes
2. Check that tests pass, remember to test migrations locally before push
3. Take manual backup of postgres

    `heroku pg:backups capture --app wappuapp-backend`

4. Push changes to production environment:

    ```bash
    git checkout master
    git pull
    git push prod
    ```

    **For testing environments:**

    You can also release a certain local branch. For example releasing from node
    branch to **dev**: `git push dev my-local-branch:master`.

5. Check that the environment responds and logs(Papertrail) look ok.

  Quick test endpoints:
  * https://wappuapp-backend.herokuapp.com/api/events
  * https://wappuapp-backend.herokuapp.com/api/feed
  * https://wappuapp-backend.herokuapp.com/api/action_types


### Update events

**NOTE:** Some data is added to the original Excel file via fuzzy match mappings.
This was done because initially we did not want to modify the original Excel file itself
to prevent csv export and character encoding problems. This is not true anymore
but some of the data is still added via fuzzy match mappings. These
could be transferred to the xlsx file already.

* Download newest .xlsx file containing events (in Drive)
* Open it in Excel
* Save as -> Windows Comma Separated. **Note:** use this specifically, not the general csv.
* If it asks: press "Save active Sheet" and "Continue"
* Run parse script:

  ```bash
  node tools/parse-events-csv.js ~/Downloads/wapputapahtumat.csv > data/events.json
  ```

* Make sure events.json looks fine
* Push newest code to remote, the events are directly read from JSON file

### Update markers

* Download the map markers spreadsheet as CSV
* Run parse script:

  ```bash
  node tools/parse-markers-csv.js ~/Downloads/markers.csv > data/markers.json
  ```

* Make sure markers.json looks fine
* Delete existing map markers from remote Postgres
* Push new code to production, knex seeds will update the markers to database

### Shadow ban user

```sql
UPDATE users SET is_banned = true WHERE uuid='D47DA01C-51BB-4F96-90B6-D64B77225EB7';
```

## API Endpoints

**READ THIS:**

* Always use `content-type: application/json` header when doing POST, PUT, PATCH requests
* All data is transferred in JSON format

  Even images are transferred as base64 strings in JSON. Why?
  - Why not?

* Be prepared that some of these endpoints are not documented correctly
* Token authentication is required. Token is sent in `x-token` header.

### `GET /api/events`

> List events

Responses:

* `200 OK` List of [event objects](event-object)


### `GET /api/teams`

> List all teams

Query parameters:

* `cityId` Integer. If specified, returns only teams based in the city with given id.
* `cityName` String. If specified, returns only teams based in the city with given name.

Responses:

* `200 OK` List of [team objects](#team-object)


### `POST /api/actions`

> Create a new action

Body is one of [action objects](#action-objects).

Responses:

* `200 OK`
* `404` On CHECK_IN_EVENT; no such event id
* `403` On CHECK_IN_EVENT; off time, off site or duplicate check in attempt.


### `PUT /api/vote`

> Vote on an feed item

Body is one of [vote object](#vote-object)

Responses:
* `200 OK`
* `404 Not found` Feed item not found


### `PUT /api/users/:uuid`

> Create or update a user

Body is one of [user object](#user-object).

Responses:

* `200 OK`

### `GET /api/users/:uuid`

> Get user details

Responses:

* `200 OK` Body is one of [user object](#user-object).
* `404 Not Found` User not found


### `GET /api/action_types`

> List action types available

Body is one of [action type object](#action-type-object).

Responses:

* `200 OK`


### `GET /api/markers`

> List map markers

Body is list of [marker objects](#marker-object).

Responses:

* `200 OK`


### `GET /api/cities`

> List participating cities

Body is list of [city objects](#city-object).

Query parameters:

* `id` Integer. If specified, returns only cities with the given ID.
* `name` String. If specified, returns only cities with the given name.

Responses:

* `200 OK`


### `GET /api/feed`

> Get list of feed

Body is one of [feed objects](#feed-objects).

Query parameters:

* `beforeId` Return items before this id, can be used for "infinite scroll" in client.
* `limit` Integer. Default: 20. 1-100. If specified, at max this many items are returned.
* `sort` String. Default: 'new'. In which order the result should be returned. One of: 'new', 'hot'.
* `cityName` String. If specified, returns only posts by users belonging to guilds based in the city with given name.
* `cityId` Integer. If specified, returns only posts by users belonging to guilds based in the city with given id.

Examples:

* Get 30 newest feed items: `GET /api/feed?limit=30`
* Load 20 more feed items: `GET /api/feed?beforeId=123&limit=20`

    Assuming the id of oldest/last feed item client currently has is `123`.

Responses:

* `200 OK`


### `DELETE /api/feed/:id`

> Delete item from feed

`:id` Is the id of an item in the feed.

### `GET /api/mood`

> Get list of day by day mood

Query parameters:

* `cityId` Integer. If specified, returned ratingCity is for the given city.
* `cityName` String. If specified, returned ratingCity is for the given city.
* `teamId` Integer. If specified, returned ratingTeam is for the given team.
* `teamName` String. If specified, returned ratingTeam is for the given team.

If omitted, header client info is used to determine city and team instead.


Body is a list of [mood objects](#mood-objects).


### `PUT /api/mood`

> Create or update mood

Body is one of [mood objects](#mood-objects).

Responses:

* `200 OK`
* `403 Forbidden` If uuid has not been included in header.


## Response objects

### Event object

```js
{
  "name": "Akateeminen Herwannan vahvin mies 2016",
  "locationName": "Tietotalon edusta",
  "startTime": "2016-04-20T09:00:00.000Z",
  "endTime": "2016-04-20T14:00:00.000Z",
  "description": "Strong man competition",
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
  "name": "Tietoteekkarikilta",
  "image_path": "foo.com/path_to_image.jpg",
  "score": "10",
  "cityId": 3,
  "cityName": "tampere"
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

### Marker object

```js
{
  location: {
    latitude: -1.2345,
    longitude: 56.2322
  },

  // One of STORE, ALKO, TOILET, TAXI, BAR, RESTAURANT
  type: "STORE",
  title: "K-Supermarket Herkkuduo",

  // Optional url
  url: "http://www.k-supermarket.fi/"
}
```

### Vote object

```js
{
  // one of 1, -1
  "value": 1,
  "feedItemId": 12
}
```

### City object

```js
{
  "id": 2,
  "name": "helsinki"
}
```

### Mood objects

#### GET mood object

```js
{
  "date": "2016-04-15T22:00:00.000Z",
  "ratingCity": "3.3333",     // May be null
  "ratingTeam": "5.0000",     // May be null
  "ratingPersonal": "10.0000" // May be null
}
```

#### PUT mood object

```js
{
  // Dacimal. Range [0, 10]. Rounded to 4th decimal mark.
  "rating": 10,
  // Optional
  "description": "Its friday!"
}
```

### Action objects

#### Basic action object

`type` is one of `SIMA`, `CHECK_IN_EVENT` or `LECTURE`.

```js
{
  // required when event type 'CHECK_IN_EVENT'
  location: {
    latitude: -1.2345,
    longitude: 56.2322
  },
  type: "SIMA",
  team: 1,
  user: 'UUID',
  // required when event type 'CHECK_IN_EVENT'
  eventId: 'Tampere_0'
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
  id: 1,
  // location is optional so it might be not provided
  location: {
    latitude: -1.2345,
    longitude: 56.2322
  },
  type: "IMAGE",
  createdAt: "2016-04-20T09:00:00.000Z",
  votes: 10,
  hotScore: 178.0032,
  author: {
    name: "Nahkasimo",
    team: "Sähkökilta",
    city: "tampere",
    cityId: 3,
    // Can be 'ME', 'OTHER_USER', 'SYSTEM'
    type: "ME"
  },
  url: "https://storage.googleapis.com/wappuapp/user_content/123.jpg"
}
```

#### Text feed object

```js
{
  id: 1,
  // location is optional so it might be not provided
  location: {
    latitude: -1.2345,
    longitude: 56.2322
  },
  type: "TEXT",
  createdAt: "2016-04-20T09:00:00.000Z",
  votes: 10,
  // If and how the user has voted. One of [-1, 0, 1].
  userVote: 0,
  hotScore: 178.0021,
  author: {
    name: "Nahkasimo",
    team: "Sähkökilta",
    city: "tampere",
    cityId: 3,
    // Can be 'ME', 'OTHER_USER', 'SYSTEM'
    type: "ME"
  },
  text: "Joujou"
}
```

## Error handling

When HTTP status code is 400 or higher, response is in format:

```json
{
  "error": "Internal Server Error"
}
```

=======

## Acknowledgements
This project is a grateful recipient of the [Futurice Open Source sponsorship program](http://futurice.com/blog/sponsoring-free-time-open-source-activities). ♥
