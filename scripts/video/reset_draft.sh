#!/bin/zsh
# Puts the landing draft's hero heading back to the published wording before a recording.
T=$(python3 -c "import json,os;print(json.load(open(os.path.expanduser('~/.config/sanity/config.json')))['authToken'])")
curl -s -X POST "https://${SANITY_PROJECT_ID:-vg4jfonv}.api.sanity.io/v2026-10-01/data/mutate/production" -H "Authorization: Bearer $T" -H 'content-type: application/json' \
  -d '{"mutations":[{"patch":{"id":"drafts.landing","set":{"sections[_key==\"k0001\"].heading":"Every bank, every entity, one cash position before the morning call."}}}]}'
