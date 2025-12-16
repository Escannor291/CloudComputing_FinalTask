# CARA MENJALANKAN PROJECT
# Script untuk Windows PowerShell

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   CLOUD STORAGE SYSTEM - START SCRIPT    " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if running in correct directory
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "ERROR: Jalankan script ini dari root folder project!" -ForegroundColor Red
    Write-Host "Pastikan ada folder 'backend' dan 'frontend'" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Checklist Persiapan:" -ForegroundColor Yellow
Write-Host "  [1] Backend .env sudah dikonfigurasi?" -ForegroundColor White
Write-Host "  [2] Frontend .env sudah dikonfigurasi?" -ForegroundColor White
Write-Host "  [3] Node.js sudah terinstall?" -ForegroundColor White
Write-Host ""
$confirmation = Read-Host "Lanjutkan? (Y/n)"
if ($confirmation -eq 'n') {
    exit 0
}

Write-Host ""
Write-Host "🔧 Step 1: Install Dependencies..." -ForegroundColor Green

# Backend dependencies
Write-Host "   - Installing backend dependencies..." -ForegroundColor White
Set-Location backend
if (-not (Test-Path "node_modules")) {
    npm install
} else {
    Write-Host "     ✓ Backend dependencies already installed" -ForegroundColor Gray
}
Set-Location ..

# Frontend dependencies
Write-Host "   - Installing frontend dependencies..." -ForegroundColor White
Set-Location frontend
if (-not (Test-Path "node_modules")) {
    npm install
} else {
    Write-Host "     ✓ Frontend dependencies already installed" -ForegroundColor Gray
}
Set-Location ..

Write-Host ""
Write-Host "✅ Dependencies installed!" -ForegroundColor Green
Write-Host ""

# Start servers
Write-Host "🚀 Step 2: Starting Servers..." -ForegroundColor Green
Write-Host ""
Write-Host "   Backend akan jalan di:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Frontend akan jalan di: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "   ⚠️  CATATAN: Buka 2 terminal terpisah untuk menjalankan keduanya" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Terminal 1 (Backend):" -ForegroundColor White
Write-Host "     cd backend" -ForegroundColor Gray
Write-Host "     npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "   Terminal 2 (Frontend):" -ForegroundColor White
Write-Host "     cd frontend" -ForegroundColor Gray
Write-Host "     npm start" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Mau start backend dulu? (Y/n)"
if ($choice -ne 'n') {
    Write-Host ""
    Write-Host "🟢 Starting Backend..." -ForegroundColor Green
    Write-Host "   (Tekan Ctrl+C untuk stop)" -ForegroundColor Yellow
    Write-Host ""
    Set-Location backend
    npm start
}
