# Wappuapp backend

Get started:

* `cp .env-sample .env`  
* `npm install`
* `npm start`

Start using [API endpoints](#api-endpoints).

Production environment: https://wappuapp-backend.herokuapp.com

## Tech

* Node.js express app
* Written in ES6
* Winston for logging

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
