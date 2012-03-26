#!/bin/sh

# requires: git, curl, unzip

# fetch chromeless from git
rm -rf chromeless
git clone git://github.com/fbreuer/chromeless.git

# fetch mathjax
#
#curl -O https://github.com/mathjax/MathJax/zipball/v2.0
#unzip mathjax-MathJax-v2.0-0-g4a4f535.zip
#rm mathjax-MathJax-v2.0-0-g4a4f535.zip
#
cd src/lib/
rm -rf mathjax
git clone git://github.com/mathjax/MathJax.git mathjax
rm -rf mathjax/.git
rm -rf mathjax/fonts/HTML-CSS/TeX/png
rm -rf unpacked
# if somebody knows a cleaner way to get a *small* image of MathJax,
# please let me know!



