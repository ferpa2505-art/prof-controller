# Script para configurar Wrangler e deploiar o Worker
# Uso: .\setup-wrangler.ps1

Write-Host "🚀 Setup do Cloudflare Worker para Levia IA Backend" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Passo 1: Verificar se Node.js está instalado
Write-Host "✓ Passo 1: Verificar Node.js..." -ForegroundColor Green
try {
    $nodeVersion = node --version
    Write-Host "  Node.js $nodeVersion encontrado ✓" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "  Baixe em: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Passo 2: Verificar/Instalar Wrangler
Write-Host ""
Write-Host "✓ Passo 2: Verificar Wrangler..." -ForegroundColor Green
try {
    $wranglerVersion = wrangler --version
    Write-Host "  Wrangler $wranglerVersion encontrado ✓" -ForegroundColor Green
} catch {
    Write-Host "  Wrangler não encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g wrangler
    Write-Host "  Wrangler instalado ✓" -ForegroundColor Green
}

# Passo 3: Verificar credenciais Cloudflare
Write-Host ""
Write-Host "✓ Passo 3: Verificar login Cloudflare..." -ForegroundColor Green
$cloudflareConfig = "$env:USERPROFILE\.wrangler"
if (Test-Path "$cloudflareConfig\config.toml") {
    Write-Host "  Credenciais Cloudflare encontradas ✓" -ForegroundColor Green
} else {
    Write-Host "  Faça login no Cloudflare..." -ForegroundColor Yellow
    wrangler login
    Write-Host "  Login realizado ✓" -ForegroundColor Green
}

# Passo 4: Verificar wrangler.toml
Write-Host ""
Write-Host "✓ Passo 4: Verificar wrangler.toml..." -ForegroundColor Green
if (Test-Path ".\wrangler.toml") {
    Write-Host "  wrangler.toml encontrado ✓" -ForegroundColor Green
    
    # Mostrar conteúdo
    Write-Host ""
    Write-Host "  Conteúdo atual:" -ForegroundColor Cyan
    Get-Content ".\wrangler.toml" | foreach { Write-Host "    $_" }
    
    # Perguntar se quer editar
    Write-Host ""
    $editConfig = Read-Host "  Deseja editar wrangler.toml? (s/n)"
    if ($editConfig -eq "s") {
        notepad ".\wrangler.toml"
        Write-Host "  Arquivo editado. Salve e feche." -ForegroundColor Yellow
        Read-Host "  Pressione Enter quando terminar..."
    }
} else {
    Write-Host "  ❌ wrangler.toml não encontrado!" -ForegroundColor Red
    Write-Host "  Crie o arquivo com o conteúdo de backend/README.md" -ForegroundColor Yellow
    exit 1
}

# Passo 5: Adicionar secret (Google Vision API Key)
Write-Host ""
Write-Host "✓ Passo 5: Configurar Google Vision API Key..." -ForegroundColor Green
Write-Host "  Você tem o arquivo levia-ia-service.json?" -ForegroundColor Cyan
$hasKey = Read-Host "  (s/n)"

if ($hasKey -eq "s") {
    Write-Host ""
    Write-Host "  Instrução: Abra levia-ia-service.json no Bloco de notas" -ForegroundColor Yellow
    Write-Host "  Copie TODO o conteúdo (Ctrl+A, Ctrl+C)" -ForegroundColor Yellow
    Write-Host "  Cole aqui quando o terminal pedir" -ForegroundColor Yellow
    Write-Host ""
    
    $openFile = Read-Host "  Deseja abrir o arquivo agora? (s/n)"
    if ($openFile -eq "s") {
        if (Test-Path "$env:USERPROFILE\Downloads\levia-ia-service.json") {
            notepad "$env:USERPROFILE\Downloads\levia-ia-service.json"
        } else {
            Write-Host "  Arquivo não encontrado em Downloads" -ForegroundColor Yellow
            Write-Host "  Procure manualmente e abra com o Bloco de notas" -ForegroundColor Yellow
        }
        Read-Host "  Arquivo aberto. Pressione Enter quando terminar..."
    }
    
    Write-Host ""
    Write-Host "  Agora vou executar: wrangler secret put GOOGLE_VISION_API_KEY" -ForegroundColor Cyan
    Write-Host ""
    
    wrangler secret put GOOGLE_VISION_API_KEY
    
    Write-Host ""
    Write-Host "  Secret adicionado ✓" -ForegroundColor Green
} else {
    Write-Host "  ❌ Precisa do arquivo levia-ia-service.json!" -ForegroundColor Red
    Write-Host "  Siga os passos em: GUIA_GOOGLE_CLOUD_SETUP.md" -ForegroundColor Yellow
    exit 1
}

# Passo 6: Deploy
Write-Host ""
Write-Host "✓ Passo 6: Deploy do Worker..." -ForegroundColor Green
Write-Host "  Executando: wrangler deploy" -ForegroundColor Cyan
Write-Host ""

wrangler deploy

Write-Host ""
Write-Host "✅ SUCESSO!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Copie a URL do Worker mostrada acima" -ForegroundColor Cyan
Write-Host "2. Configure em .env.local:" -ForegroundColor Cyan
Write-Host "   EXPO_PUBLIC_WORKER_URL=https://seu-worker.seu-subdomain.workers.dev" -ForegroundColor Cyan
Write-Host "3. Restart o app: expo start --clear" -ForegroundColor Cyan
Write-Host "4. Teste: Vá para Prato Análise > Capturar foto > Analisar" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tudo pronto! 🚀" -ForegroundColor Green
