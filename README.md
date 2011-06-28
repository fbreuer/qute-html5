# Welcome to **Qute**!

[Qute](http://www.inkcode.net/qute) is a text editor with Markdown and TeX support. Qute offers per paragraph preview, i.e., users can switch between editing the source and viewing a rich text rendering with typeset formulas for each paragraph separately. Other features are a minimalist interface, several themes and a fullscreen mode for distraction-free writing.

Qute is built with web technologies, using Chromeless, Showdown and MathJax. 

Qute is licensed under the AGPL version 3.

For more information, check the [Qute website](http://www.inkcode.net/qute).

## Installation

Grab a zip archive for Windows or Mac OS X from github, extract it and run Qute!

As of now, you need to compile Qute yourself if you are on Linux.

## Compiling

You need to install Chromeless and MathJax to compile Qute.  If `qute` is the name of the source directory, then you need to place Chromeless in `qute/chromeless` and MathJax in `qute/src/lib/mathjax`. You may want to delete the docs and image fonts from the MathJax distribution to speed compilation.
