#!/bin/sh

OUTPUTDIR=chromeless/build/Qute/

python chromeless/chromeless appify src

cp LICENSE-AGPL $OUTPUTDIR
cp README.md $OUTPUTDIR
cp src/img/icon.ico $OUTPUTDIR
