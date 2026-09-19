@echo off
REM ProF Controller - Build All Platforms
REM Windows Build Script

echo.
echo ========================================
echo ProF Controller - Build Multiplataforma
echo ========================================
echo.

:menu
echo.
echo Qual platform deseja buildar?
echo.
echo 1) Windows (.exe)
echo 2) Android (.apk)
echo 3) Web PWA (GitHub Pages)
echo 4) Todos (Windows + Web)
echo 5) Sair
echo.

set /p choice="Escolha uma opcao (1-5): "

if "%choice%"=="1" goto build_windows
if "%choice%"=="2" goto build_android
if "%choice%"=="3" goto build_web
if "%choice%"=="4" goto build_all
if "%choice%"=="5" goto exit
goto menu

:build_windows
echo.
echo Buildando para Windows...
call npm run electron-build-win
echo.
echo Instalador criado em: release/ProF Controller Setup 1.0.0.exe
pause
goto menu

:build_android
echo.
echo Preparando Android...
call npm run capacitor:add-android
echo.
echo Abrindo Android Studio...
call npm run capacitor:open-android
echo.
echo No Android Studio:
echo 1. Build ^> Build Bundle / APK
echo 2. Escolha APK
echo 3. Clique Build
echo 4. Arquivo fica em: android/app/release/app-release.apk
pause
goto menu

:build_web
echo.
echo Deploy ja esta em: https://ferpa2505-art.github.io/prof-controller/
echo.
pause
goto menu

:build_all
echo.
echo Buildando para Windows...
call npm run electron-build-win
echo.
echo Feito! Instalador em: release/ProF Controller Setup 1.0.0.exe
echo.
pause
goto menu

:exit
echo Saindo...
exit /b 0
