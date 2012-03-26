# Welcome to **Qute**!

[Qute](http://www.inkcode.net/qute) is a text editor with Markdown and TeX support. Qute offers per paragraph preview, i.e., users can switch between editing the source and viewing a rich text rendering with typeset formulas for each paragraph separately. Other features are a minimalist interface, several themes and a fullscreen mode for distraction-free writing.

Qute is built with web technologies, using Chromeless, Showdown and MathJax. 

Qute is licensed under the AGPL version 3.

For more information, check the [Qute website](http://www.inkcode.net/qute).

## Installation

Grab a zip archive for Windows, Mac OS X or Linux from github, extract it and run Qute!

## Compiling

The are compiling instructions for Linux. Adapt for Windows and OS X by reading the scripts mentioned below.

Prerequisite: you need to have git installed on your system.

1. Run <code>bootstrap.sh</code>. This will fetch chromeless and mathjax. You will only need to do that once before the first compile.
2. Run <code>compile.sh</code>. This will build Qute from source. The first time this is run, xulrunner will be fetched, but this fetch will not happen on subsequent compiles.
3. Run Qute, either by running <code>./chromeless/build/Qute/Qute</code> or <code>run.sh</code>.


Copyright (C) 2011 Felix Breuer