#!/usr/bin/env pwsh
# Script para monitorar build EAS

$projectSlug = "ferpa2505-art/pesos-app"
$buildId = "d5e23a14-01d3-4f69-b106-e05d817f004f"

Write-Host "🔍 Monitorando build EAS..." -ForegroundColor Cyan
Write-Host "Projeto: $projectSlug" -ForegroundColor Green
Write-Host "Build ID: $buildId" -ForegroundColor Green
Write-Host ""
Write-Host "Dashboard: https://expo.dev/accounts/ferpa2505-art/projects/pesos-app/builds/$buildId" -ForegroundColor Magenta
Write-Host ""

# Abrir dashboard no navegador
Start-Process "https://expo.dev/accounts/ferpa2505-art/projects/pesos-app/builds/$buildId"

Write-Host "✅ Dashboard aberto no navegador" -ForegroundColor Green
Write-Host "⏳ Build pode levar 15-30 minutos para completar..." -ForegroundColor Yellow
