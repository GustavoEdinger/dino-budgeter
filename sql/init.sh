#!/usr/bin/env bash

psql --host=127.0.0.1 --user=budgeter --dbname=budgeter --no-password < sql/init.sql
