#!/bin/bash

source .env
knex migrate:rollback
knex migrate:latest
knex seed:run
