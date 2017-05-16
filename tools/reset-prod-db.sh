#!/bin/bash

source .env
export PGSSLMODE=require
export DATABASE_URL=$(heroku config:get DATABASE_URL -a praha-app-prod)
knex migrate:rollback
knex migrate:latest
knex seed:run
