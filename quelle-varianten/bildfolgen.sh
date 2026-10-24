#!/bin/sh
# Bildfolgen (Hero-Aufnahmen, Walk-Clip) aus den Clips von Reel 3 gewinnen. Aufruf im Ordner quelle-varianten: sh bildfolgen.sh
set -e
( cd ../quelle-3 && sh clips/extract.sh )
rm -rf assets/hero assets/walk
cp -r ../quelle-3/assets/hero ../quelle-3/assets/walk assets/
