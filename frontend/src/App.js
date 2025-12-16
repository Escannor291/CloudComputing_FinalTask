import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [token, setToken] = useState('');
  const [file, setFile] = useState(null);
  const [course, setCourse] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [fadeIn, setFadeIn] = useState(false);
  const [activeMenu, setActiveMenu] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [courses, setCourses] = useState([]);
  
  // State untuk login & register
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState('');

  useEffect(() => {
    // Trigger fade-in animation on mount
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  useEffect(() => {
    // Auto-hide message after 3 seconds
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const login = async () => {
    if (!username || !password) {
      setMessage("Username dan password harus diisi!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password
      });
      setToken(res.data.token);
      setCurrentUser(username);
      setMessage("Login berhasil!");
      load(res.data.token);
      setUsername('');
      setPassword('');
    } catch (error) {
      setMessage("Login gagal: " + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    if (!username || !password) {
      setMessage("Username dan password harus diisi!");
      return;
    }

    if (password.length < 6) {
      setMessage("Password minimal 6 karakter!");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/auth/register`, {
        username,
        password,
        role: "user"
      });
      setMessage("Registrasi berhasil! Silakan login.");
      setIsRegisterMode(false);
      setUsername('');
      setPassword('');
    } catch (error) {
      setMessage("Registrasi gagal: " + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    setFiles([]);
    setCurrentUser('');
    setMessage('Logout berhasil!');
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    setMobileMenuOpen(false);
  };

  const load = async (tkn) => {
    try {
      const res = await axios.get(`${API_URL}/api/files/list`, {
        headers: { Authorization: "Bearer " + tkn }
      });
      setFiles(res.data);
      
      // Extract unique courses
      const uniqueCourses = [...new Set(res.data.map(f => f.partitionKey))];
      setCourses(uniqueCourses);
    } catch (error) {
      setMessage("Gagal memuat file: " + error.message);
    }
  };

  const upload = async () => {
    if (!file || !course) {
      setMessage("Pilih file dan isi mata kuliah!");
      return;
    }

    try {
      setLoading(true);
      const form = new FormData();
      form.append("file", file);
      form.append("course", course);

      await axios.post(`${API_URL}/api/files/upload`, form, {
        headers: { Authorization: "Bearer " + token }
      });

      setMessage("Upload berhasil!");
      setCourse('');
      setFile(null);
      document.querySelector('input[type="file"]').value = '';
      load(token);
    } catch (error) {
      setMessage("Upload gagal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (blobName, filename) => {
    if (!window.confirm(`Hapus file "${filename}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/api/files/delete/${blobName}`, {
        headers: { Authorization: "Bearer " + token }
      });

      setMessage("File berhasil dihapus!");
      load(token);
    } catch (error) {
      setMessage("Gagal menghapus file: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`app-container ${fadeIn ? 'fade-in' : ''}`}>
      {!token ? (
        <div className="login-container">
          <div className="login-card scale-in">
            <div className="login-header">
              <h2>{isRegisterMode ? 'Daftar Akun Baru' : 'Login'}</h2>
              <p>{isRegisterMode ? 'Buat akun untuk mengelola tugas Anda' : 'Masuk untuk mengakses sistem penyimpanan file'}</p>
            </div>
            
            <div className="form-group">
              <label>Username</label>
              <input 
                type="text"
                className="form-input"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (isRegisterMode ? register() : login())}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input 
                type="password"
                className="form-input"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (isRegisterMode ? register() : login())}
              />
              {isRegisterMode && <small className="form-hint">Minimal 6 karakter</small>}
            </div>

            <button 
              className="btn btn-primary btn-large pulse-hover" 
              onClick={isRegisterMode ? register : login}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                isRegisterMode ? "Daftar" : "Login"
              )}
            </button>

            <div className="auth-toggle">
              {isRegisterMode ? (
                <p>Sudah punya akun? <span onClick={() => setIsRegisterMode(false)}>Login di sini</span></p>
              ) : (
                <p>Belum punya akun? <span onClick={() => setIsRegisterMode(true)}>Daftar di sini</span></p>
              )}
            </div>

            {message && <div className="message slide-up">{message}</div>}
          </div>
        </div>
      ) : (
        <>
          <nav className="navbar slide-down">
            <div className="navbar-brand">
              <h1>📋 ManageIt</h1>
              <span className="navbar-subtitle">Sistem Manajemen Tugas Akademik</span>
            </div>
            <div className="navbar-menu fade-in-right">
              <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                ☰
              </button>
              <span className="navbar-user">{currentUser}</span>
              <button className="btn btn-logout" onClick={logout}>Logout</button>
            </div>
          </nav>

          <div className="layout">
            <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
              <div className="sidebar-section">
                <div className="sidebar-title">Menu</div>
                <ul className="sidebar-nav">
                  <li 
                    className={`sidebar-item ${activeMenu === 'overview' ? 'active' : ''}`}
                    onClick={() => handleMenuClick('overview')}
                  >
                    Overview
                  </li>
                  <li 
                    className={`sidebar-item ${activeMenu === 'upload' ? 'active' : ''}`}
                    onClick={() => handleMenuClick('upload')}
                  >
                    Upload
                  </li>
                  <li 
                    className={`sidebar-item ${activeMenu === 'files' ? 'active' : ''}`}
                    onClick={() => handleMenuClick('files')}
                  >
                    Files
                  </li>
                  <li 
                    className={`sidebar-item ${activeMenu === 'settings' ? 'active' : ''}`}
                    onClick={() => handleMenuClick('settings')}
                  >
                    Settings
                  </li>
                </ul>
              </div>
              <div className="sidebar-footer">Tugas Akhir - Cloud Computing</div>
            </aside>

            {mobileMenuOpen && <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>}

            <main className="main-area">
              <div className="content-grid">
                {activeMenu === 'overview' && (
                  <section className="overview-section slide-up">
                    <h2>Dashboard Overview</h2>
                    <p className="section-description">Kelola tugas mata kuliah Anda dengan mudah</p>
                    <div className="stats-grid">
                      <div className="stat-card">
                        <h3>Total Mata Kuliah</h3>
                        <p className="stat-number">{courses.length}</p>
                      </div>
                      <div className="stat-card">
                        <h3>Total Tugas</h3>
                        <p className="stat-number">{files.length}</p>
                      </div>
                    </div>
                    
                    <div className="courses-overview">
                      <h3>📚 Mata Kuliah Anda</h3>
                      {courses.length === 0 ? (
                        <p style={{color: '#999', textAlign: 'center', padding: '2rem'}}>Belum ada mata kuliah</p>
                      ) : (
                        <div className="courses-list">
                          {courses.map(c => (
                            <div key={c} className="course-item" onClick={() => {
                              setSelectedCourse(c);
                              setActiveMenu('files');
                            }}>
                              <div className="course-name">{c}</div>
                              <div className="course-count">{files.filter(f => f.partitionKey === c).length} tugas</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {activeMenu === 'upload' && (
                  <section className="upload-section slide-up">
                    <h2>Upload Tugas</h2>
                    <p className="section-description">Upload file tugas untuk mata kuliah tertentu</p>
                    <div className="form-group">
                      <label>Mata Kuliah *</label>
                      <input 
                        type="text"
                        className="form-input"
                        placeholder="Contoh: Cloud Computing, Database, Pemrograman Web"
                        value={course}
                        onChange={e => setCourse(e.target.value)}
                        list="course-suggestions"
                      />
                      <datalist id="course-suggestions">
                        {courses.map(c => <option key={c} value={c} />)}
                      </datalist>
                      <small className="form-hint">Ketik nama mata kuliah atau pilih dari daftar yang ada</small>
                    </div>
                    <div className="form-group">
                      <label>File Tugas *</label>
                      <input 
                        type="file" 
                        className="form-input-file"
                        onChange={e => setFile(e.target.files[0])}
                      />
                      {file && <span className="file-name fade-in">{file.name}</span>}
                    </div>
                    <button 
                      className="btn btn-success btn-large pulse-hover" 
                      onClick={upload}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="spinner"></span>
                      ) : (
                        "Upload File"
                      )}
                    </button>
                    {message && <div className="message success slide-up">{message}</div>}
                  </section>
                )}

                {activeMenu === 'files' && (
                  <section className="files-section slide-up">
                    <div className="section-header">
                      <h2>Daftar Tugas</h2>
                      <div className="section-header-actions">
                        <select 
                          className="course-filter" 
                          value={selectedCourse}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                          <option value="all">Semua Mata Kuliah ({files.length})</option>
                          {courses.map(c => (
                            <option key={c} value={c}>
                              {c} ({files.filter(f => f.partitionKey === c).length})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {files.length === 0 ? (
                      <div className="empty-state fade-in">
                        <p>Belum ada tugas yang diupload</p>
                        <small>Upload tugas pertama Anda untuk memulai</small>
                      </div>
                    ) : (
                      <>
                        {(selectedCourse === 'all' ? files : files.filter(f => f.partitionKey === selectedCourse)).length === 0 ? (
                          <div className="empty-state fade-in">
                            <p>Tidak ada tugas untuk mata kuliah {selectedCourse}</p>
                          </div>
                        ) : (
                          <div className="files-grid">
                            {(selectedCourse === 'all' ? files : files.filter(f => f.partitionKey === selectedCourse)).map((f, index) => (
                          <div 
                            key={f.rowKey} 
                            className="file-card"
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            <div className="file-card-header">
                              <div className="file-icon">{f.filename.split('.').pop().toUpperCase()}</div>
                              <span className="file-badge">{f.partitionKey}</span>
                            </div>
                            <div className="file-card-body">
                              <h3 className="file-title">{f.filename}</h3>
                              <div className="file-meta">
                                <span>👤 {f.uploader}</span>
                                <span>📅 {new Date(f.uploadedAt).toLocaleDateString('id-ID')}</span>
                                <span>🕐 {new Date(f.uploadedAt).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</span>
                              </div>
                            </div>
                            <div className="file-card-actions">
                              <a 
                                href={f.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="btn btn-download"
                              >
                                Download
                              </a>
                              <button 
                                className="btn btn-delete"
                                onClick={() => deleteFile(f.blobName || f.rowKey, f.filename)}
                                disabled={loading}
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                        )}
                      </>
                    )}
                  </section>
                )}

                {activeMenu === 'settings' && (
                  <section className="settings-section slide-up">
                    <h2>Settings</h2>
                    <div className="settings-content">
                      <h3>Account Information</h3>
                      <p>Username: admin</p>
                      <p>Role: Administrator</p>
                      <hr />
                      <h3>Azure Configuration</h3>
                      <p>Storage Account: tugascloudcomputing</p>
                      <p>Container: tugas</p>
                      <p>Table: filemetadata</p>
                    </div>
                  </section>
                )}
              </div>
            </main>
          </div>

          <footer className="app-footer fade-in">
            <p>&copy; 2025 Tugas Akhir Cloud Computing - Powered by Azure</p>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
