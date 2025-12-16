# 📚 Sistem Manajemen Tugas Akademik - Cloud Computing Final Project

Aplikasi web berbasis cloud untuk mengelola tugas mata kuliah menggunakan Microsoft Azure.

## 🌟 Fitur Utama

- 🔐 **Multi-User System** - Setiap user dapat membuat akun sendiri
- 📝 **Register & Login** - Sistem autentikasi yang aman dengan bcrypt
- 🔒 **User Isolation** - Setiap user hanya melihat file mereka sendiri
- 📤 **Upload File** - Upload tugas dalam berbagai format (PDF, DOCX, JPG, PNG)
- 📁 **File Management** - Organize file berdasarkan mata kuliah
- 🔍 **Search & Filter** - Cari file berdasarkan nama atau mata kuliah
- 📥 **Download File** - Download kembali file yang sudah diupload
- ❌ **Delete File** - Hapus file milik sendiri (tidak bisa hapus file user lain)

## 🏗️ Arsitektur

```
┌─────────────────────┐
│   Azure Static Web  │
│   (React Frontend)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Azure App Service  │
│  (Node.js Backend)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Azure Storage      │
│  - Blob Storage     │
│  - Table Storage    │
└─────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI Framework
- **CSS3** - Styling
- **Axios** - HTTP Client
- **Azure Static Website** - Hosting

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **Azure App Service** - Hosting
- **Multer** - File Upload Handler
- **@azure/storage-blob** - File Storage
- **@azure/data-tables** - Metadata Storage

### Cloud Services
- **Azure Blob Storage** - Penyimpanan file
- **Azure Table Storage** - Penyimpanan metadata
- **Azure App Service** - Backend hosting
- **Azure Static Website** - Frontend hosting

## 📂 Struktur Project

```
.
├── backend/                 # Node.js Backend
│   ├── index.js            # Main server file
│   ├── routes/
│   │   ├── auth.js        # Authentication endpoints
│   │   └── files.js       # File management endpoints
│   ├── users.json         # User database
│   └── package.json
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── App.js         # Main app component
│   │   ├── App.css        # Global styles
│   │   └── index.js       # Entry point
│   ├── public/
│   └── package.json
│
├── CARA_DEPLOY_KE_AZURE.md           # Panduan deploy
├── PANDUAN_DEMO_PRESENTASI.md        # Panduan presentasi
└── PRESENTASI_FINAL.md               # Slide presentasi
```

## 🚀 Cara Menjalankan Lokal

### Prerequisites
- Node.js v14+
- npm atau yarn
- Azure Storage Account (untuk fitur upload)

### 1. Clone Repository
```bash
git clone https://github.com/Escannor291/CloudComputing_FinalTask.git
cd CloudComputing_FinalTask
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Buat file `.env` dan tambahkan:
```env
PORT=5000
AZURE_STORAGE_CONNECTION_STRING=your_connection_string_here
```

Jalankan backend:
```bash
npm start
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm start
```

Frontend akan berjalan di `http://localhost:3000`

## ☁️ Deployment ke Azure

### Backend ke Azure App Service
```bash
cd backend
# Login ke Azure
az login

# Deploy
az webapp up --name backend-tugas-akademik --resource-group your-rg --runtime "NODE:18-lts"
```

### Frontend ke Azure Static Website
```bash
cd frontend
npm run build

# Upload ke Azure Storage $web container
az storage blob upload-batch -s build -d '$web' --account-name tugascloudcomputing
```

**Lihat [CARA_DEPLOY_KE_AZURE.md](CARA_DEPLOY_KE_AZURE.md) untuk panduan lengkap**

## 🔗 Live Demo

- **Frontend**: https://tugascloudcomputing.z23.web.core.windows.net
- **Backend API**: https://backend-tugas-akademik.azurewebsites.net

### Cara Menggunakan
1. **Daftar Akun Baru**: Klik "Daftar di sini" pada halaman login
2. **Buat Username & Password**: Minimal 6 karakter untuk password
3. **Login**: Gunakan kredensial yang baru dibuat
4. **Upload Tugas**: Setiap user hanya bisa melihat dan mengelola file mereka sendiri

### Privacy & Security
- ✅ Setiap user memiliki workspace terpisah
- ✅ File user lain tidak terlihat dan tidak bisa diakses
- ✅ Password di-hash dengan bcrypt untuk keamanan
- ✅ Authentication menggunakan JWT token

## 📸 Screenshots

### Login Page
![Login](docs/login.png)

### Dashboard
![Dashboard](docs/dashboard.png)

### Upload File
![Upload](docs/upload.png)

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user

### File Management
- `GET /api/files` - Get semua file user
- `POST /api/files/upload` - Upload file baru
- `GET /api/files/:id` - Download file
- `DELETE /api/files/:id` - Hapus file

## 📊 Monitoring & Logging

- Application Insights untuk monitoring performa
- Azure Monitor untuk logs backend
- Storage Analytics untuk tracking file operations

## 🔒 Security

- CORS configuration untuk keamanan API
- Environment variables untuk credential sensitif
- User authentication & authorization
- Secure file upload dengan validasi file type

## 🤝 Contributing

Pull requests are welcome! Untuk perubahan besar, buka issue terlebih dahulu untuk diskusi.

## 📝 License

[MIT](LICENSE)

## 👨‍💻 Author

**Dea Afrizal**
- GitHub: [@Escannor291](https://github.com/Escannor291)
- LinkedIn: [Your LinkedIn]

## 🙏 Acknowledgments

- Microsoft Azure Documentation
- React Documentation
- Node.js Documentation
- Cloud Computing Course Materials

---

⭐ Jika project ini membantu, jangan lupa kasih star!
