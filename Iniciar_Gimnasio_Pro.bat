@echo off
title Gimnasio Pro - Servidor Local
echo ========================================================
echo             GIMNASIO PRO - ANDRES AGUIAR
echo ========================================================
echo.
echo Iniciando servidor local en http://localhost:8085 ...
echo Presione Ctrl + C para detener el servidor.
echo.

start http://localhost:8085/index.html
python -m http.server 8085
if %ERRORLEVEL% NEQ 0 (
  echo Python no disponible, abriendo directamente en navegador...
  start index.html
)
pause
