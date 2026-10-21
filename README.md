# KerjaHub - Portal Berbagi Poster Lowongan Kerja & Karir Impian

Aplikasi web modern **Job Portal** yang difokuskan 100% untuk **pencari kerja menemukan info & poster lowongan pekerjaan**, serta **panel admin mandiri untuk mengunggah poster**.

---

## 🌐 Alamat Akses (Link Terpisah Mandiri)

Aplikasi ini memisahkan link antara pengunjung publik (pencari kerja) dan pengelola (admin):

1. **Website Publik (Khusus Pencari Kerja)**:
   - **Local Node.js**: [http://localhost:5000](http://localhost:5000)
   - **Apache XAMPP**: [http://localhost/job_portal/public/index.html](http://localhost/job_portal/public/index.html) (atau [http://localhost/job_portal/](http://localhost/job_portal/))
   - *Fokus 100% untuk pelamar mencari kerja tanpa registrasi akun, tanpa campur aduk menu admin.*

2. **Panel Admin (Khusus Pengelola & Upload Poster)**:
   - **Local Node.js**: [http://localhost:5000/admin](http://localhost:5000/admin)
   - **Apache XAMPP**: [http://localhost/job_portal/public/admin.html](http://localhost/job_portal/public/admin.html)
   - **Password Admin**: Sesuai konfigurasi di `.env` (`ADMIN_PASSWORD`)
   - *Area terbatas mandiri dengan Dashboard statistik, Drag-and-drop Poster Uploader, dan Manajemen lowongan (Edit, Toggle Aktif/Tutup, Hapus).*

---

## ✨ Fitur Interaktif Baru untuk Pencari Kerja

1. **Pencarian Cepat & Tren Kata Kunci (Instant Search & Trending Chips)**:
   - Pencarian instan otomatis tanpa perlu tekan enter / reload.
   - Tombol hapus cepat (`✕`) di kolom pencarian.
   - Chip kata kunci populer: *React / Web, UI/UX Designer, Digital Marketing, Graphic Designer, AI Specialist, Remote (WFH), Fresh Graduate*.

2. **Navigasi Tab Cepat (Quick Filter Tabs)**:
   - **Semua Lowongan**: Daftar lengkap lowongan aktif.
   - **Unggulan ⭐**: Lowongan prioritas dan terverifikasi.
   - **Remote (WFH) 🏠**: Lowongan kerja dari rumah.
   - **Fresh Graduate 🎓**: Lowongan ramah lulusan baru.
   - **Disimpan ❤️**: Daftar lowongan favorit pelamar (tersimpan di browser).

3. **Simpan Lowongan Favorit (Bookmark Tanpa Registrasi)**:
   - Klik tombol hati (❤️) pada kartu lowongan untuk menyimpan lowongan impian.
   - Counter dinamis di Navbar dan Tab navigasi.

4. **Bar Filter Aktif (Active Filters Bar)**:
   - Menampilkan chip filter yang sedang aktif dengan tombol hapus satuan dan tombol *Reset Semua*.

5. **Detail Interaktif & Match Meter (Interactive Checklist)**:
   - Kotak checklist kualifikasi di mana pelamar dapat mencentang keahlian yang dimiliki.
   - Bar persentase kecocokan profil pelamar secara live *(0% - 100% Cocok!)*.

6. **1-Click Salin Template Pesan Lamaran ke HRD**:
   - Disediakan draft perkenalan chat WhatsApp/Email yang sopan dan profesional.
   - Satu klik tombol *Salin Pesan* untuk langsung disalin ke clipboard.

7. **Hubungi Rekruter Multi-Channel (WhatsApp, Email & Web Link)**:
   - Mendukung 3 kontak sekaligus (WhatsApp, Email, dan Website Pendaftaran Resmi).
   - Tombol langsung mengarahkan ke chat WhatsApp HRD (otomatis mendeteksi WhatsApp Web di Desktop atau aplikasi WhatsApp di Smartphone) disertai tombol cepat *Salin Nomor WA*.
   - Tombol email langsung membuka draft lamaran lengkap dengan subjek dan isi pesan.

8. **Sistem Lock / Lowongan Kedaluwarsa (Expired)**:
   - Lowongan yang telah ditutup atau kedaluwarsa dikunci oleh admin.
   - Lowongan tetap tampil di beranda user sebagai arsip transparan, namun bertanda badge `TELAH DITUTUP (EXPIRED)`.
   - Tombol aksi dinonaktifkan sehingga pelamar tidak dapat mengajukan lamaran baru.

9. **Smart AI CV Matcher (Unggah CV & Cek Kesesuaian Lowongan)**:
   - Pelamar dapat mengunggah berkas CV (PDF, DOCX, TXT) atau menempel teks ringkasan keahlian.
   - Sistem AI otomatis memindai kata kunci kompetensi (frontend, backend, design, marketing, data, dsb.) dan mencocokkannya dengan seluruh lowongan aktif.
   - Hasil diurutkan berdasarkan persentase kecocokan (*Kecocokan CV: XX%*) disertai tag skill yang cocok.

10. **Scout Loker Media Sosial (Admin Generator LinkedIn, Instagram, Facebook)**:
   - Fitur admin untuk mencari referensi lowongan kerja secara massal dari LinkedIn, Instagram, dan Facebook secara bersamaan atau terpilih.
   - Menghasilkan tautan deep search real-time dan kartu bahan lowongan siap pakai.
   - Tombol 1-klik *Jadikan Draft Lowongan* untuk langsung mengisi form unggah poster tanpa perlu copy-paste manual satu per satu.

11. **Tampilan Fleksibel & Tema**:
   - Mode Grid Cards dan Mode List.
   - Dukungan Dark Mode dan Light Mode.
   - Panel admin yang estetik dan elegan dengan widget live status di bagian bawah sidebar.

---

## 🛠️ Menjalankan Aplikasi

```bash
cd c:\xampp\htdocs\job_portal
npm run dev
```
*(atau `npm start`)*
