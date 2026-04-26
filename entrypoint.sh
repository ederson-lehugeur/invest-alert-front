#!/bin/sh
cd /app
node dist/invest-alert-front/server/server.mjs &
nginx -g 'daemon off;'
