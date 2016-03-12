#!/bin/bash

# Usage bash get-event-pic.sh tampin-paljastus.jpg "http://ttyy.kuvat.fi/kuvat/Wappuinfo/Wappuinfo-2015_04_09_1112150057.jpg"

IMAGE_FILE=$1
IMAGE_URL=$2

echo "curl -o \"$IMAGE_FILE\" \"$IMAGE_URL\""
curl -o "$IMAGE_FILE" "$IMAGE_URL"

echo "gsutil cp \"$IMAGE_FILE\" \"gs://wappuapp/assets/$IMAGE_FILE\""
gsutil cp "$IMAGE_FILE" "gs://wappuapp/assets/$IMAGE_FILE"

echo "rm \"$IMAGE_FILE\""
rm "$IMAGE_FILE"
