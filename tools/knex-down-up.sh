#!/bin/bash

knex migrate:rollback
knex migrate:latest
VERBOSE_SEEDS=true knex seed:run
