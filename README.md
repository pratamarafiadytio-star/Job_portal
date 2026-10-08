# KerjaHub - Portal Berbagi Poster Lowongan Kerja

Aplikasi web modern **Job Portal** yang difokuskan 100% untuk **berbagi poster & informasi lowongan pekerjaan**, tanpa perlu instalasi database rumit dan tanpa sistem pengisian formulir data diri bagi pengunjung.

---

## 🎯 Konsep & Fokus Utama

1. **Tanpa Database SQL (Zero DB Config)**:
   - Data lowongan disimpan rapi dalam berkas JSON lokal (`data/jobs.json`).
   - Tidak memerlukan MySQL, SQLite, PostgreSQL, ataupun database server lain.
   - Sangat ringan, cepat, dan mudah dipindahkan.

2. **Fokus Berbagi Lowongan Kerja (Job Sharing)**:
   - Pengunjung website **TIDAK PERLU** mengisi form data diri, upload CV, atau daftar akun.
   - Pengunjung cukup melihat poster desain flyer lowongan, membaca kualifikasi/deskripsi, dan langsung mengklik tombol **"Hubungi via WhatsApp"**, **"Kirim Email"**, atau **"Buka Tautan Resmi"**.
   - Dilengkapi fitur berbagi instan: **Bagikan ke WhatsApp**, **Salin Tautan**, dan **Unduh Poster**.

3. **Panel Admin Khusus Upload & Kelola Poster**:
   - Upload flyer gambar poster lowongan (JPG, PNG, WEBP) dengan *live preview*.
   - Mengisi keterangan posisi, kualifikasi, tanggung jawab, benefit, estimasi gaji, dan kontak perekrut (WA/Email/Link).
   - Kelola lowongan: ubah status aktif/tutup, edit keterangan, atau hapus lowongan.

---

## 🌐 Alamat Akses

- **Website Publik**: [http://localhost:5000](http://localhost:5000)
- **Panel Admin**: [http://localhost:5000/admin](http://localhost:5000/admin)

---

## 🛠️ Menjalankan Aplikasi

```bash
cd c:\xampp\htdocs\job_portal
npm run dev
```
*(atau `npm start`)*
