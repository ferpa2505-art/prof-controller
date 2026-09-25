# Monitor BUILD #8 - Expo EAS
# Acompanha o progresso da compilação em tempo real

$BUILD_ID = "300b841c-17ae-4dd7-833b-05ea5238865f"
$PROJECT = "pesos-app"
$ACCOUNT = "ferpa2505-art"

Write-Host "🔍 Monitorando BUILD #8..." -ForegroundColor Cyan
Write-Host "Build ID: $BUILD_ID" -ForegroundColor Gray
Write-Host ""

$url = "https://expo.dev/accounts/$ACCOUNT/projects/$PROJECT/builds/$BUILD_ID"
Write-Host "📱 Dashboard: $url" -ForegroundColor Blue
Write-Host ""

$startTime = Get-Date
$timeout = 1800  # 30 minutos

while ($true) {
    $elapsed = (Get-Date) - $startTime
    $remainingSeconds = $timeout - [int]$elapsed.TotalSeconds
    
    if ($remainingSeconds -le 0) {
        Write-Host "⏱️  Timeout! Build demorou mais de 30 min." -ForegroundColor Red
        break
    }
    
    Write-Host "⏳ Tempo decorrido: $([int]$elapsed.TotalMinutes)m$([int]$elapsed.Seconds)s (timeout em $(($remainingSeconds / 60).ToString('N1'))m)" -ForegroundColor Yellow
    Write-Host ""
    
    # Próximo check em 10 segundos
    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host "✅ Verifique o resultado em: $url" -ForegroundColor Green
