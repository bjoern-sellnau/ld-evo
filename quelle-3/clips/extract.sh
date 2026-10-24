#!/bin/sh
# Bildfolgen für reel3.html aus den Clips zurückgewinnen (ffmpeg nötig). Aufruf im Ordner quelle-3: sh clips/extract.sh
set -e
for m in blackhole aurora galaxy fireworks ocean nova plasma kaleido tunnel metal prism aurum viola storm2; do
  mkdir -p assets/hero/$m
  ffmpeg -v error -y -i clips/hero_$m.mp4 -q:v 2 -start_number 0 assets/hero/$m/f%03d.jpg
done
mkdir -p assets/build/buildcode assets/walk
ffmpeg -v error -y -i clips/build_buildcode.mp4 -q:v 2 -start_number 0 assets/build/buildcode/f%03d.jpg
ffmpeg -v error -y -i clips/walk.mp4 -q:v 2 -start_number 1 assets/walk/w%03d.jpg
