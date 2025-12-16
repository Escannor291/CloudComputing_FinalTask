# Script untuk Re-deploy Frontend ke Azure Storage
# Jalankan script ini setiap kali ada perubahan di frontend

Write-Host "🚀 Memulai re-deployment frontend..." -ForegroundColor Cyan

# 1. Pindah ke folder frontend
Set-Location "c:\Users\ASUS\Desktop\TugasAkhir CloudComputing\frontend"

# 2. Build production
Write-Host "`n📦 Building production..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build gagal!" -ForegroundColor Red
    exit 1
}

# 3. Upload ke Azure Storage
Write-Host "`n☁️ Uploading to Azure Storage..." -ForegroundColor Yellow
az storage blob upload-batch `
    --account-name tugascloudcomputing `
    --source build `
    --destination '$web' `
    --overwrite

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deployment berhasil!" -ForegroundColor Green
    Write-Host "`n🌐 Frontend URL: https://tugascloudcomputing.z23.web.core.windows.net/" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Upload gagal!" -ForegroundColor Red
    exit 1
}
