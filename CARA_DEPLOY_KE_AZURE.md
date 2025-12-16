# 🚀 CARA DEPLOY APLIKASI KE AZURE (LOCAL → CLOUD)

## 📋 RINGKASAN SINGKAT

```
LOCAL (Laptop Anda)           →           AZURE CLOUD (Diakses Semua Orang)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FRONTEND (React)               →           Azure Storage Static Website
http://localhost:3000          →           https://tugascloudcomputing.z23.web.core.windows.net

BACKEND (Node.js)              →           Azure App Service
http://localhost:5000          →           https://backend-tugas-akademik.azurewebsites.net

DATABASE (Local JSON)          →           Azure Storage (Blob + Table)
users.json                     →           Blob Storage + Table Storage
```

---

## ⚙️ PERSIAPAN AWAL

### 1. Install Azure CLI

```powershell
# Download dan install Azure CLI
# Link: https://aka.ms/installazurecliwindows

# Setelah install, verify
az --version
```

### 2. Login ke Azure

```powershell
# Login dengan akun Microsoft Anda
az login

# Browser akan terbuka, login dengan akun Azure Anda
# Setelah sukses, terminal akan show subscription info
```

### 3. Set Default Subscription (jika punya multiple)

```powershell
# Lihat semua subscriptions
az account list --output table

# Set default subscription
az account set --subscription "Nama_Subscription_Anda"
```

---

## 🗂️ LANGKAH 1: SETUP AZURE RESOURCES

### A. Buat Resource Group

```powershell
# Buat resource group (container untuk semua resources)
az group create `
  --name CloudComputing `
  --location southeastasia
```

### B. Buat Storage Account

```powershell
# Buat storage account untuk frontend & file storage
az storage account create `
  --name tugascloudcomputing `
  --resource-group CloudComputing `
  --location southeastasia `
  --sku Standard_LRS `
  --kind StorageV2
```

### C. Enable Static Website Hosting

```powershell
# Enable static website untuk hosting frontend React
az storage blob service-properties update `
  --account-name tugascloudcomputing `
  --static-website `
  --index-document index.html `
  --404-document index.html
```

### D. Buat Blob Container untuk File Upload

```powershell
# Buat container untuk menyimpan file yang diupload user
az storage container create `
  --name tugas `
  --account-name tugascloudcomputing `
  --public-access off
```

### E. Buat Table Storage untuk Metadata

```powershell
# Buat table untuk menyimpan metadata file
az storage table create `
  --name filemetadata `
  --account-name tugascloudcomputing
```

### F. Ambil Connection String

```powershell
# Ambil connection string (butuh untuk backend)
az storage account show-connection-string `
  --name tugascloudcomputing `
  --resource-group CloudComputing `
  --output table

# COPY connection string yang muncul!
# Format: DefaultEndpointsProtocol=https;AccountName=...
```

---

## 🖥️ LANGKAH 2: DEPLOY BACKEND KE AZURE APP SERVICE

### A. Siapkan Backend Files

```powershell
# Masuk ke folder backend
cd "C:\Users\ASUS\Desktop\TugasAkhir CloudComputing\backend"

# Pastikan .gitignore sudah exclude:
# - node_modules/
# - .env
# - users.json (optional, akan dibuat otomatis)
```

### B. Deploy Backend ke App Service

```powershell
# Deploy backend (Azure akan otomatis create App Service)
az webapp up `
  --name backend-tugas-akademik `
  --runtime "NODE:20-lts" `
  --resource-group CloudComputing `
  --location southeastasia `
  --sku FREE

# Tunggu 3-5 menit untuk deployment selesai
# Output akan show URL: https://backend-tugas-akademik.azurewebsites.net
```

### C. Set Environment Variables di App Service

```powershell
# Set environment variables (ganti dengan connection string Anda!)
az webapp config appsettings set `
  --name backend-tugas-akademik `
  --resource-group CloudComputing `
  --settings `
    AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=tugascloudcomputing;AccountKey=YOUR_KEY;EndpointSuffix=core.windows.net" `
    JWT_SECRET="your-super-secret-key-change-this" `
    AZURE_STORAGE_ACCOUNT_NAME="tugascloudcomputing" `
    BLOB_CONTAINER_NAME="tugas" `
    TABLE_NAME="filemetadata"
```

### D. Enable CORS untuk Frontend

```powershell
# Allow frontend untuk access backend API
az webapp cors add `
  --name backend-tugas-akademik `
  --resource-group CloudComputing `
  --allowed-origins `
    "https://tugascloudcomputing.z23.web.core.windows.net" `
    "http://localhost:3000"
```

### E. Verify Backend Running

```powershell
# Test backend API
Invoke-WebRequest -Uri "https://backend-tugas-akademik.azurewebsites.net/health"

# Atau buka di browser:
Start-Process "https://backend-tugas-akademik.azurewebsites.net"
```

---

## 🎨 LANGKAH 3: DEPLOY FRONTEND KE AZURE STORAGE

### A. Buat Environment File untuk Production

```powershell
# Masuk ke folder frontend
cd "C:\Users\ASUS\Desktop\TugasAkhir CloudComputing\frontend"

# Buat file .env.production
echo "REACT_APP_API_URL=https://backend-tugas-akademik.azurewebsites.net" > .env.production
```

### B. Build Frontend React

```powershell
# Install dependencies (jika belum)
npm install

# Build production version
npm run build

# Output: folder build/ berisi static files (HTML, CSS, JS)
```

### C. Upload ke Azure Storage

```powershell
# Upload semua files ke $web container (static website)
az storage blob upload-batch `
  --account-name tugascloudcomputing `
  --destination '$web' `
  --source ./build `
  --overwrite

# Tunggu 1-2 menit untuk upload selesai
```

### D. Ambil Frontend URL

```powershell
# Get frontend URL
az storage account show `
  --name tugascloudcomputing `
  --resource-group CloudComputing `
  --query "primaryEndpoints.web" `
  --output tsv

# Output: https://tugascloudcomputing.z23.web.core.windows.net/
```

### E. Test Frontend di Browser

```powershell
# Buka frontend URL
Start-Process "https://tugascloudcomputing.z23.web.core.windows.net"
```

---

## ✅ LANGKAH 4: TESTING APLIKASI LIVE

### A. Test Login

1. Buka: https://tugascloudcomputing.z23.web.core.windows.net
2. Klik "Login as Admin"
3. Credentials: admin / admin123
4. ✅ Harus berhasil login

### B. Test Upload File

1. Klik tab "Upload"
2. Input mata kuliah: "Cloud Computing"
3. Pilih file (PDF/DOCX)
4. Klik "Upload"
5. ✅ File harus berhasil diupload

### C. Test View Files

1. Klik tab "Files"
2. ✅ File yang diupload harus muncul
3. Test filter dropdown mata kuliah

### D. Test Download

1. Klik tombol "Download" di salah satu file
2. ✅ File harus terdownload

### E. Test Delete

1. Klik tombol "Delete"
2. Confirm dialog
3. ✅ File harus terhapus

### F. Verify di Azure Portal

```powershell
# Buka Azure Portal
Start-Process "https://portal.azure.com"

# Check:
# 1. Storage Account → Containers → tugas → (ada file yang diupload)
# 2. Storage Account → Tables → filemetadata → (ada metadata)
```

---

## 🔄 CARA UPDATE APLIKASI (Setelah Edit Code)

### Update Backend:

```powershell
cd "C:\Users\ASUS\Desktop\TugasAkhir CloudComputing\backend"

# Re-deploy backend
az webapp up --name backend-tugas-akademik

# Tunggu 2-3 menit
```

### Update Frontend:

```powershell
cd "C:\Users\ASUS\Desktop\TugasAkhir CloudComputing\frontend"

# Build ulang
npm run build

# Upload ulang
az storage blob upload-batch `
  --account-name tugascloudcomputing `
  --destination '$web' `
  --source ./build `
  --overwrite

# Tunggu 1-2 menit
# Refresh browser (Ctrl+F5 untuk hard refresh)
```

---

## 🆘 TROUBLESHOOTING

### Problem: Frontend tidak bisa akses backend (CORS error)

**Solution:**
```powershell
# Add CORS policy
az webapp cors add `
  --name backend-tugas-akademik `
  --resource-group CloudComputing `
  --allowed-origins "https://tugascloudcomputing.z23.web.core.windows.net"
```

### Problem: Backend error 500

**Solution:**
```powershell
# Check logs
az webapp log tail --name backend-tugas-akademik

# Check environment variables
az webapp config appsettings list `
  --name backend-tugas-akademik `
  --resource-group CloudComputing
```

### Problem: File upload gagal

**Solution:**
```powershell
# Verify storage connection string di App Service
az webapp config appsettings list `
  --name backend-tugas-akademik | Select-String "AZURE_STORAGE"

# Jika kosong, set ulang (Langkah 2C)
```

### Problem: Frontend shows old version

**Solution:**
```powershell
# Clear browser cache (Ctrl+Shift+Delete)
# Atau hard refresh (Ctrl+F5)

# Atau clear Azure CDN cache
az storage blob delete-batch `
  --account-name tugascloudcomputing `
  --source '$web'

# Upload ulang
az storage blob upload-batch `
  --account-name tugascloudcomputing `
  --destination '$web' `
  --source ./build
```

---

## 📊 DIAGRAM DEPLOYMENT FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT PROCESS                           │
└─────────────────────────────────────────────────────────────────┘

STEP 1: SETUP AZURE RESOURCES (One-time setup)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌──────────────────┐
│  az login        │  Login ke Azure
└────────┬─────────┘
         ↓
┌──────────────────┐
│ az group create  │  Buat Resource Group: CloudComputing
└────────┬─────────┘
         ↓
┌──────────────────────────┐
│ az storage account create│  Buat Storage Account: tugascloudcomputing
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│ Enable static website    │  Frontend hosting
│ Create container: tugas  │  File uploads
│ Create table: metadata   │  File metadata
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│ Get connection string    │  For backend configuration
└──────────────────────────┘


STEP 2: DEPLOY BACKEND
━━━━━━━━━━━━━━━━━━━━━━━
┌──────────────────┐
│   cd backend     │  Masuk folder backend
└────────┬─────────┘
         ↓
┌──────────────────┐
│  az webapp up    │  Deploy ke App Service: backend-tugas-akademik
└────────┬─────────┘
         ↓
┌──────────────────────────┐
│ Set environment vars     │  Connection string, JWT secret, etc.
└────────┬─────────────────┘
         ↓
┌──────────────────┐
│ Enable CORS      │  Allow frontend access
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Test backend URL │  https://backend-tugas-akademik.azurewebsites.net
└──────────────────┘


STEP 3: DEPLOY FRONTEND
━━━━━━━━━━━━━━━━━━━━━━━
┌──────────────────────┐
│   cd frontend        │  Masuk folder frontend
└────────┬─────────────┘
         ↓
┌──────────────────────┐
│ Create .env.production │  REACT_APP_API_URL=backend_url
└────────┬──────────────┘
         ↓
┌──────────────────────┐
│   npm run build      │  Build React app → folder build/
└────────┬─────────────┘
         ↓
┌──────────────────────────┐
│ az storage blob upload   │  Upload ke $web container
└────────┬─────────────────┘
         ↓
┌──────────────────────┐
│ Test frontend URL    │  https://tugascloudcomputing.z23.web.core.windows.net
└──────────────────────┘


STEP 4: VERIFICATION
━━━━━━━━━━━━━━━━━━━━
┌──────────────────────┐
│ Test Login           │  ✅
├──────────────────────┤
│ Test Upload          │  ✅
├──────────────────────┤
│ Test Download        │  ✅
├──────────────────────┤
│ Test Delete          │  ✅
├──────────────────────┤
│ Check Azure Portal   │  ✅ Files di Blob Storage
│                      │  ✅ Metadata di Table Storage
└──────────────────────┘

🎉 APLIKASI LIVE & ACCESSIBLE UNTUK SEMUA ORANG! 🎉
```

---

## 🌐 HASIL AKHIR

Setelah semua langkah selesai, aplikasi Anda akan:

✅ **Accessible untuk semua orang** dengan internet
✅ **Frontend:** https://tugascloudcomputing.z23.web.core.windows.net
✅ **Backend:** https://backend-tugas-akademik.azurewebsites.net
✅ **Uptime:** 99.9% (Azure SLA guarantee)
✅ **Security:** HTTPS, JWT, SAS tokens
✅ **Scalability:** Auto-scale jika traffic tinggi
✅ **Cost:** ~Rp 0-280,000/bulan

---

## ⏱️ TOTAL WAKTU DEPLOYMENT

| Task | Duration |
|------|----------|
| Install Azure CLI | 5 menit |
| Setup Azure Resources | 10-15 menit |
| Deploy Backend | 5-10 menit |
| Deploy Frontend | 3-5 menit |
| Testing & Verification | 10-15 menit |
| **TOTAL** | **35-50 menit** |

---

## 📝 CATATAN PENTING

### Yang Harus Disimpan:
1. ✅ Azure connection string (untuk backend)
2. ✅ JWT_SECRET (untuk authentication)
3. ✅ Frontend URL (untuk share ke orang lain)
4. ✅ Backend URL (untuk API testing)

### Yang JANGAN Di-commit ke Git:
1. ❌ `.env` file (contains secrets)
2. ❌ `node_modules/` folder
3. ❌ `build/` folder (generated)
4. ❌ Connection strings
5. ❌ API keys

### Security Best Practices:
1. ✅ Ganti JWT_SECRET dengan random string yang kuat
2. ✅ Never commit secrets ke GitHub
3. ✅ Use environment variables untuk production
4. ✅ Enable HTTPS (otomatis di Azure)
5. ✅ Set SAS token expiration (24 jam)

---

## 🎯 QUICK REFERENCE COMMANDS

```powershell
# ===== LOGIN & SETUP =====
az login
az account set --subscription "Your_Subscription"

# ===== DEPLOY BACKEND =====
cd backend
az webapp up --name backend-tugas-akademik

# ===== DEPLOY FRONTEND =====
cd frontend
npm run build
az storage blob upload-batch --account-name tugascloudcomputing --destination '$web' --source ./build --overwrite

# ===== CHECK STATUS =====
az webapp show --name backend-tugas-akademik --query "state"
az storage account show --name tugascloudcomputing --query "primaryEndpoints.web"

# ===== VIEW LOGS =====
az webapp log tail --name backend-tugas-akademik

# ===== RESTART SERVICES =====
az webapp restart --name backend-tugas-akademik
```

---

## 🚀 SELAMAT! APLIKASI ANDA SUDAH LIVE DI CLOUD!

Sekarang siapapun dengan internet bisa akses aplikasi Anda di:
**https://tugascloudcomputing.z23.web.core.windows.net**

Share link ini ke teman, dosen, atau siapapun! 🎉
