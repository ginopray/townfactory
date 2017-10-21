#!/bin/bash
# Crea documentazione con jsdoc.

../node_modules/.bin/jsdoc ../public/script -r -P ../package.json -d ../docs

