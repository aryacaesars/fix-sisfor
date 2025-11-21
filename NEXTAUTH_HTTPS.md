# NextAuth HTTPS Configuration Guide

## Apakah NextAuth Harus Menggunakan HTTPS?

### ✅ **Production: HARUS HTTPS**
- **Ya, untuk production Anda HARUS menggunakan HTTPS**
- Alasan keamanan:
  - Cookie session akan dikirim secara aman
  - Mencegah man-in-the-middle attacks
  - Browser modern memblokir cookie secure di HTTP
  - OAuth providers (Google, GitHub, dll) memerlukan HTTPS

### ✅ **Development: HTTP OK**
- **Untuk development lokal (localhost), HTTP diperbolehkan**
- NextAuth akan bekerja dengan `http://localhost:3000`
- Tidak perlu sertifikat SSL untuk development

## Konfigurasi Environment Variables

### Development (Local)
```env
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### Production (Vercel/Deployment)
```env
# Di Vercel Environment Variables
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret-key
```

## Catatan Penting

1. **Vercel otomatis menyediakan HTTPS**
   - Semua deployment di Vercel otomatis menggunakan HTTPS
   - Tidak perlu konfigurasi tambahan
   - Pastikan `NEXTAUTH_URL` menggunakan `https://`

2. **NEXTAUTH_URL harus sesuai dengan domain Anda**
   - Development: `http://localhost:3000`
   - Production: `https://your-app.vercel.app` atau `https://yourdomain.com`

3. **trustHost: true**
   - Sudah ditambahkan di konfigurasi untuk mendukung proxy (Vercel, dll)
   - Memungkinkan NextAuth bekerja di balik reverse proxy

## Troubleshooting

### Error: "Invalid URL" atau Cookie tidak bekerja
- Pastikan `NEXTAUTH_URL` sudah di-set dengan benar
- Pastikan menggunakan `https://` di production
- Pastikan tidak ada trailing slash di akhir URL

### Cookie tidak tersimpan di browser
- Pastikan menggunakan HTTPS di production
- Check browser console untuk error CORS atau cookie

## Contoh Konfigurasi

### Vercel Environment Variables
```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-random-secret-here
DATABASE_URL=your-database-url
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Generate NEXTAUTH_SECRET
```bash
# Di terminal
openssl rand -base64 32
```

atau online: https://generate-secret.vercel.app/32

