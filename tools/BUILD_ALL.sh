#!/bin/bash

# ProF Controller - Build All Platforms
# macOS/Linux Build Script

echo ""
echo "========================================"
echo "ProF Controller - Build Multiplataforma"
echo "========================================"
echo ""

while true; do
  echo ""
  echo "Qual plataforma deseja buildar?"
  echo ""
  echo "1) macOS (.dmg)"
  echo "2) Linux (.AppImage + .deb)"
  echo "3) Windows (.exe - requer Wine ou WSL)"
  echo "4) Android (.apk)"
  echo "5) iOS (.ipa - requer Xcode)"
  echo "6) Web PWA (GitHub Pages)"
  echo "7) Todos (macOS + Linux)"
  echo "8) Sair"
  echo ""
  
  read -p "Escolha uma opcao (1-8): " choice
  
  case $choice in
    1)
      echo ""
      echo "Buildando para macOS..."
      npm run electron-build-mac
      echo ""
      echo "Instalador criado em: release/ProF Controller 1.0.0.dmg"
      read -p "Pressione Enter para continuar..."
      ;;
    2)
      echo ""
      echo "Buildando para Linux..."
      npm run electron-build-linux
      echo ""
      echo "Instaladores criados em: release/"
      ls -lh release/ProF\ Controller*.{AppImage,deb} 2>/dev/null || true
      read -p "Pressione Enter para continuar..."
      ;;
    3)
      echo ""
      echo "Para Windows em macOS/Linux, use WSL2 ou Wine"
      echo "Ou compile em uma máquina Windows"
      read -p "Pressione Enter para continuar..."
      ;;
    4)
      echo ""
      echo "Preparando Android..."
      npm run capacitor:add-android
      echo ""
      echo "Abrindo Android Studio..."
      npm run capacitor:open-android
      echo ""
      echo "No Android Studio:"
      echo "1. Build > Build Bundle / APK"
      echo "2. Escolha APK"
      echo "3. Clique Build"
      echo "4. Arquivo fica em: android/app/release/app-release.apk"
      read -p "Pressione Enter para continuar..."
      ;;
    5)
      echo ""
      echo "Preparando iOS..."
      npm run capacitor:add-ios
      echo ""
      echo "Abrindo Xcode..."
      npm run capacitor:open-ios
      echo ""
      echo "No Xcode:"
      echo "1. Product > Archive"
      echo "2. Distribute > App Store"
      read -p "Pressione Enter para continuar..."
      ;;
    6)
      echo ""
      echo "Deploy ja esta em: https://ferpa2505-art.github.io/prof-controller/"
      echo ""
      read -p "Pressione Enter para continuar..."
      ;;
    7)
      echo ""
      echo "Buildando para macOS..."
      npm run electron-build-mac
      echo ""
      echo "Buildando para Linux..."
      npm run electron-build-linux
      echo ""
      echo "Feito! Instaladores em: release/"
      ls -lh release/
      read -p "Pressione Enter para continuar..."
      ;;
    8)
      echo "Saindo..."
      exit 0
      ;;
    *)
      echo "Opcao invalida!"
      ;;
  esac
done
