set PATH=C:\Python27;%PATH%
set OUTPUTDIR=chromeless\build\Qute\

python chromeless\chromeless appify src

copy LICENSE-AGPL %OUTPUTDIR%
copy README.md %OUTPUTDIR%
copy src\img\icon.ico %OUTPUTDIR%
