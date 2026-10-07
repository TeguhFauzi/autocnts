# 100 Skenario Usecase Tak Terduga (Edge Cases) — AutoCountSoft

Format setiap skenario: **Langkah** (cara memicu) dan **Ekspektasi** (hasil benar), plus prioritas (P1 kritikal, P2 penting, P3 minor).

## A. Pagination & Data List (1–15)

### Skenario 1 — Data tepat 1 halaman penuh
- **Langkah:** Buka list dengan jumlah data = page size (10 item).
- **Ekspektasi:** Info "Showing 1–10 of 10", tombol Next disabled, "Page 1 of 1".
- **Prioritas:** P2

### Skenario 2 — Data kosong
- **Langkah:** List tanpa satu pun data.
- **Ekspektasi:** Pesan "tidak ada data", info "0–0 of 0", tombol disabled, tidak ada "Page 1 of 0".
- **Prioritas:** P2

### Skenario 3 — Halaman terakhir terisi sebagian
- **Langkah:** 11 item, page size 10, buka halaman 2.
- **Ekspektasi:** Hanya 1 baris, info "Showing 11–11 of 11".
- **Prioritas:** P3

### Skenario 4 — Klik Next beruntun cepat
- **Langkah:** Klik tombol Next beberapa kali dengan cepat.
- **Ekspektasi:** Page hanya bertambah sesuai klik valid, tidak race/meloncat 2 halaman.
- **Prioritas:** P1

### Skenario 5 — Previous di halaman 1
- **Langkah:** Coba klik Previous di halaman pertama.
- **Ekspektasi:** Tombol disabled; page tidak pernah 0 atau negatif.
- **Prioritas:** P2

### Skenario 6 — Ganti filter saat di halaman > 1
- **Langkah:** Pindah ke halaman 3, lalu ubah filter/search.
- **Ekspektasi:** Page reset ke 1, hasil baru sesuai filter.
- **Prioritas:** P1

### Skenario 7 — Hapus item terakhir di halaman terakhir
- **Langkah:** Di halaman 2 (isi 1 item), hapus item tersebut.
- **Ekspektasi:** totalPages berkurang, kembali ke halaman 1, count update.
- **Prioritas:** P1

### Skenario 8 — Create item saat di halaman 2
- **Langkah:** Buka halaman 2, tambah 1 item baru.
- **Ekspektasi:** total/totalPages ter-update, kartu info "Showing X–Y of Z" benar.
- **Prioritas:** P2

### Skenario 9 — Refresh browser di halaman > 1
- **Langkah:** Pindah ke halaman 2 lalu refresh.
- **Ekspektasi:** Konsisten (kembali ke 1 atau tetap di 2), tidak error.
- **Prioritas:** P3

### Skenario 10 — Drift data antar user
- **Langkah:** User A hapus data; user B klik Next pada halaman terakhir.
- **Ekspektasi:** UI tampil state kosong/valid, bukan crash atau "Page 3 of 2".
- **Prioritas:** P2

### Skenario 11 — Page size ekstrem
- **Langkah:** Set limit=100 dan limit=5.
- **Ekspektasi:** Info akurat di kedua ukuran.
- **Prioritas:** P3

### Skenario 12 — total=0, totalPages=1
- **Langkah:** API balas `{total:0, totalPages:1}`.
- **Ekspektasi:** Pagination render "0–0 of 0", aman.
- **Prioritas:** P2

### Skenario 13 — page melewati jangkauan
- **Langkah:** Request `?page=9999`.
- **Ekspektasi:** Balas data kosong/valid, bukan 500.
- **Prioritas:** P2

### Skenario 14 — page tidak valid
- **Langkah:** Request `?page=0`, `?page=-1`, `?page=abc`.
- **Ekspektasi:** Di-clamp ke 1 atau 400 jelas.
- **Prioritas:** P2

### Skenario 15 — limit tidak valid
- **Langkah:** Request `?limit=0`, `?limit=99999`.
- **Ekspektasi:** Di-clamp (1..100) atau 400.
- **Prioritas:** P2

## B. Portal Customer (16–35)

### Skenario 16 — customerId tidak ada di session
- **Langkah:** Login customer tanpa `customerId`, buka portal.
- **Ekspektasi:** Daftar faktur kosong + pesan, tanpa crash.
- **Prioritas:** P1

### Skenario 17 — Manipulasi parameter code
- **Langkah:** Customer akses `/api/portal/invoices?code=C-LAIN`.
- **Ekspektasi:** Tetap hanya faktur milik session customer, parameter code diabaikan.
- **Prioritas:** P1

### Skenario 18 — Bayar faktur sudah PAID
- **Langkah:** Kirim POST pay untuk faktur berstatus PAID.
- **Ekspektasi:** Ditolak/tidak mengubah paid & status.
- **Prioritas:** P1

### Skenario 19 — Double-click tombol bayar
- **Langkah:** Klik "Bayar" dua kali cepat.
- **Ekspektasi:** Hanya satu pembayaran tercatat.
- **Prioritas:** P1

### Skenario 20 — Nominal bayar tidak valid
- **Langkah:** Bayar 0 / nominal negatif.
- **Ekspektasi:** Validasi menolak, tidak ada perubahan data.
- **Prioritas:** P1

### Skenario 21 — Partial payment lalu lunas
- **Langkah:** Bayar sebagian, bayar sisa.
- **Ekspektasi:** Status PARTIAL lalu PAID saat paid >= total.
- **Prioritas:** P2

### Skenario 22 — invoiceId milik customer lain
- **Langkah:** POST pay dengan id faktur orang lain.
- **Ekspektasi:** 403/404.
- **Prioritas:** P1

### Skenario 23 — Item catalog field null
- **Langkah:** Item tanpa price/description/uom.
- **Ekspektasi:** Card tetap render dengan fallback.
- **Prioritas:** P3

### Skenario 24 — Catalog > 1 halaman
- **Langkah:** Pindah halaman 2 catalog lalu refresh.
- **Ekspektasi:** total/totalPages konsisten dari server.
- **Prioritas:** P2

### Skenario 25 — History tanpa faktur PAID
- **Langkah:** Customer tanpa riwayat bayar.
- **Ekspektasi:** Pesan kosong + Pagination aman.
- **Prioritas:** P2

### Skenario 26 — Portal home 0 faktur
- **Langkah:** Customer tanpa faktur.
- **Ekspektasi:** Kartu "0 / 0 / Rp 0", bukan NaN.
- **Prioritas:** P2

### Skenario 27 — Kode customer admin tidak ditemukan
- **Langkah:** Admin input kode tidak valid.
- **Ekspektasi:** "Tidak ada faktur", bukan error mentah.
- **Prioritas:** P2

### Skenario 28 — Session expired saat bayar
- **Langkah:** Session habis di tengah pelunasan.
- **Ekspektasi:** Pesan login ulang, bukan error stack.
- **Prioritas:** P1

### Skenario 29 — Ganti password salah password lama
- **Langkah:** Submit ganti password dengan password lama keliru.
- **Ekspektasi:** Ditolak dengan pesan jelas.
- **Prioritas:** P2

### Skenario 30 — History 1 item di halaman terakhir
- **Langkah:** Faktur PAID tepat di batas halaman.
- **Ekspektasi:** Navigasi halaman normal.
- **Prioritas:** P3

### Skenario 31 — Admin view & customer asli bersamaan
- **Langkah:** Admin lihat portal by kode, customer asli login.
- **Ekspektasi:** Data tidak tertukar.
- **Prioritas:** P2

### Skenario 32 — Faktur total 0
- **Langkah:** Faktur dengan total 0.
- **Ekspektasi:** Outstanding menghitung 0, tanpa error.
- **Prioritas:** P3

### Skenario 33 — Faktur overdue
- **Langkah:** Jatuh tempo kemarin, belum bayar.
- **Ekspektasi:** Status/badge sesuai aturan.
- **Prioritas:** P3

### Skenario 34 — Timezone tanggal
- **Langkah:** Server dan client beda zona waktu.
- **Ekspektasi:** Tanggal tampil konsisten.
- **Prioritas:** P3

### Skenario 35 — Nominal sangat besar
- **Langkah:** Faktur miliaran rupiah.
- **Ekspektasi:** Format money benar, tidak overflow.
- **Prioritas:** P3

## C. Faktur / Bills / Items / Journals (36–55)

### Skenario 36 — Buat faktur tanpa customer
- **Langkah:** Submit form tanpa customer.
- **Ekspektasi:** Validasi menolak.
- **Prioritas:** P1

### Skenario 37 — customerId tidak valid
- **Langkah:** Kirim customerId ngawur.
- **Ekspektasi:** Error jelas, bukan 500.
- **Prioritas:** P2

### Skenario 38 — Total tidak sinkron header vs lines
- **Langkah:** Hapus line lalu cek total.
- **Ekspektasi:** Header terhitung ulang.
- **Prioritas:** P1

### Skenario 39 — Hapus item dipakai faktur
- **Langkah:** Hapus item yang terhubung.
- **Ekspektasi:** Dicegah/soft-delete/pesan FK.
- **Prioritas:** P1

### Skenario 40 — Edit faktur sudah PAID
- **Langkah:** Ubah faktur berstatus PAID.
- **Ekspektasi:** Ditolak atau status di-reset dengan catatan.
- **Prioritas:** P2

### Skenario 41 — Bill tanpa lines
- **Langkah:** Simpan bill kosong.
- **Ekspektasi:** Total 0, bukan null.
- **Prioritas:** P3

### Skenario 42 — Qty 0 / harga negatif
- **Langkah:** Input line qty=0, price<0.
- **Ekspektasi:** Ditolak validasi.
- **Prioritas:** P2

### Skenario 43 — DocNo duplikat
- **Langkah:** Buat faktur dengan no yang sama.
- **Ekspektasi:** Pesan "sudah ada".
- **Prioritas:** P2

### Skenario 44 — Journal tidak balance
- **Langkah:** Debit ≠ kredit.
- **Ekspektasi:** Ditolak/ditandai.
- **Prioritas:** P1

### Skenario 45 — Akun nonaktif dipakai journal lama
- **Langkah:** Baca journal historis.
- **Ekspektasi:** Tetap bisa dibaca.
- **Prioritas:** P2

### Skenario 46 — Hapus akun terpakai
- **Langkah:** Hapus akun dengan journal.
- **Ekspektasi:** Dicegah/soft-delete.
- **Prioritas:** P2

### Skenario 47 — Qty on hand negatif
- **Langkah:** Jual melebihi stok.
- **Ekspektasi:** Negatif/warning, bukan korup.
- **Prioritas:** P2

### Skenario 48 — Line deskripsi manual
- **Langkah:** Line dengan itemId null.
- **Ekspektasi:** Render & total benar.
- **Prioritas:** P3

### Skenario 49 — Tanggal ekstrem
- **Langkah:** Tanggal masa depan/1900/3000.
- **Ekspektasi:** Validasi masuk akal.
- **Prioritas:** P3

### Skenario 50 — Search hasil kosong
- **Langkah:** Keyword tidak ada.
- **Ekspektasi:** State kosong berpesan.
- **Prioritas:** P3

### Skenario 51 — PDF faktur multi-halaman
- **Langkah:** Cetak faktur banyak line.
- **Ekspektasi:** Layout tidak rusak.
- **Prioritas:** P3

### Skenario 52 — Parsing harga locale
- **Langkah:** Input "Rp 1.000.000,50".
- **Ekspektasi:** Parsing benar.
- **Prioritas:** P2

### Skenario 53 — Harga 0
- **Langkah:** Item price=0.
- **Ekspektasi:** "Rp 0", bukan NaN.
- **Prioritas:** P3

### Skenario 54 — Bill tanpa supplier
- **Langkah:** Submit tanpa supplier.
- **Ekspektasi:** Validasi.
- **Prioritas:** P2

### Skenario 55 — Periode tanggal terbalik
- **Langkah:** dari > sampai.
- **Ekspektasi:** Ditolak/warning.
- **Prioritas:** P2

## D. Auth & Session (56–70)

### Skenario 56 — Kapitalisasi email login
- **Langkah:** Login dengan beda besar-kecil huruf email.
- **Ekspektasi:** Sesuai kebijakan (idealnya case-insensitive).
- **Prioritas:** P3

### Skenario 57 — Password salah beruntun
- **Langkah:** 5x gagal login.
- **Ekspektasi:** Rate-limit/pesan jelas.
- **Prioritas:** P2

### Skenario 58 — Akses admin tanpa login
- **Langkah:** Buka `/accounts` tanpa session.
- **Ekspektasi:** Redirect login.
- **Prioritas:** P1

### Skenario 59 — Customer akses halaman admin
- **Langkah:** Customer buka `/journals`.
- **Ekspektasi:** Redirect/403.
- **Prioritas:** P1

### Skenario 60 — Logout di satu tab
- **Langkah:** Logout tab A, pakai tab B.
- **Ekspektasi:** Tab B gagal dengan jelas di request berikutnya.
- **Prioritas:** P2

### Skenario 61 — Cookie dihapus manual
- **Langkah:** Hapus cookie session.
- **Ekspektasi:** Redirect login.
- **Prioritas:** P2

### Skenario 62 — Role berubah saat login
- **Langkah:** Admin ubah role user aktif.
- **Ekspektasi:** Request berikutnya pakai role baru.
- **Prioritas:** P2

### Skenario 63 — Login padahal sudah login
- **Langkah:** Buka halaman login.
- **Ekspektasi:** Redirect dashboard.
- **Prioritas:** P3

### Skenario 64 — Lupa password email tidak terdaftar
- **Langkah:** Submit email ngawur.
- **Ekspektasi:** Pesan generik.
- **Prioritas:** P2

### Skenario 65 — Token reset dipakai 2x
- **Langkah:** Gunakan token yang sama dua kali.
- **Ekspektasi:** Token kedua ditolak.
- **Prioritas:** P2

### Skenario 66 — Token kedaluwarsa
- **Langkah:** Pakai token lama.
- **Ekspektasi:** Pesan kedaluwarsa.
- **Prioritas:** P2

### Skenario 67 — Password lama salah
- **Langkah:** Ganti password.
- **Ekspektasi:** Ditolak.
- **Prioritas:** P2

### Skenario 68 — Email profil duplikat
- **Langkah:** Ubah email ke email user lain.
- **Ekspektasi:** Ditolak unik.
- **Prioritas:** P2

### Skenario 69 — Field profil null
- **Langkah:** Phone/address null.
- **Ekspektasi:** Render aman.
- **Prioritas:** P3

### Skenario 70 — POST tanpa session
- **Langkah:** curl POST pay tanpa cookie.
- **Ekspektasi:** 401.
- **Prioritas:** P1

## E. API & Validasi Input (71–85)

### Skenario 71 — JSON rusak
- **Langkah:** POST `{invoiceId:`.
- **Ekspektasi:** 400 jelas.
- **Prioritas:** P2

### Skenario 72 — Content-Type salah
- **Langkah:** POST text/plain.
- **Ekspektasi:** Ditolak.
- **Prioritas:** P3

### Skenario 73 — Query param salah tipe
- **Langkah:** `?page=abc&limit=xyz`.
- **Ekspektasi:** Default/400.
- **Prioritas:** P2

### Skenario 74 — SQL injection di code
- **Langkah:** `?code=GRA'--`.
- **Ekspektasi:** Tidak bocor data.
- **Prioritas:** P1

### Skenario 75 — XSS di nama
- **Langkah:** Nama `<script>alert(1)</script>`.
- **Ekspektasi:** Ter-escape.
- **Prioritas:** P1

### Skenario 76 — API tanpa auth
- **Langkah:** GET endpoint butuh session tanpa cookie.
- **Ekspektasi:** 401.
- **Prioritas:** P1

### Skenario 77 — CORS origin asing
- **Langkah:** Request lintas origin.
- **Ekspektasi:** Diblok sesuai config.
- **Prioritas:** P2

### Skenario 78 — Method tidak didukung
- **Langkah:** PUT ke endpoint GET.
- **Ekspektasi:** 405.
- **Prioritas:** P3

### Skenario 79 — Payload besar
- **Langkah:** Body sangat besar.
- **Ekspektasi:** 413.
- **Prioritas:** P2

### Skenario 80 — DB down
- **Langkah:** Matikan koneksi DB.
- **Ekspektasi:** 500 terkontrol + UI error state.
- **Prioritas:** P1

### Skenario 81 — Unicode
- **Langkah:** Nama emoji/aksen/CJK.
- **Ekspektasi:** Tersimpan & tampil benar.
- **Prioritas:** P3

### Skenario 82 — Tanggal invalid
- **Langkah:** "2024-13-45".
- **Ekspektasi:** Ditolak.
- **Prioritas:** P2

### Skenario 83 — Format nominal salah
- **Langkah:** "1.000,000.50" acak.
- **Ekspektasi:** Ditolak.
- **Prioritas:** P2

### Skenario 84 — Race docNo sama
- **Langkah:** 2 request create bersamaan.
- **Ekspektasi:** 1 sukses, 1 error unik.
- **Prioritas:** P2

### Skenario 85 — Snapshot harga
- **Langkah:** Ubah harga item, faktur lama belum bayar.
- **Ekspektasi:** Faktur lama tidak berubah.
- **Prioritas:** P2

## F. UI & Responsif (86–100)

### Skenario 86 — Mobile 360px
- **Langkah:** Buka di layar kecil.
- **Ekspektasi:** Tabel scroll, Pagination utuh.
- **Prioritas:** P2

### Skenario 87 — Dark mode
- **Langkah:** Aktifkan dark mode.
- **Ekspektasi:** Semua halaman terbaca.
- **Prioritas:** P3

### Skenario 88 — Koneksi lambat
- **Langkah:** Throttle 3G.
- **Ekspektasi:** Skeleton muncul, minim layout shift.
- **Prioritas:** P3

### Skenario 89 — Refresh beruntun
- **Langkah:** Klik refresh cepat berkali-kali.
- **Ekspektasi:** Tidak duplikasi/korup.
- **Prioritas:** P3

### Skenario 90 — Back browser
- **Langkah:** Detail → Back.
- **Ekspektasi:** State list konsisten.
- **Prioritas:** P3

### Skenario 91 — Pesan error panjang
- **Langkah:** Error message panjang.
- **Ekspektasi:** Terpotong rapi.
- **Prioritas:** P3

### Skenario 92 — Badge teks panjang
- **Langkah:** Status panjang.
- **Ekspektasi:** Layout tabel aman.
- **Prioritas:** P3

### Skenario 93 — Pagination 1 halaman
- **Langkah:** Hanya 1 halaman data.
- **Ekspektasi:** Tombol disabled, "Page 1 of 1".
- **Prioritas:** P3

### Skenario 94 — No JavaScript
- **Langkah:** Disable JS.
- **Ekspektasi:** Degradasi/fallback terbaca.
- **Prioritas:** P3

### Skenario 95 — Ganti bahasa
- **Langkah:** Switch ID ↔ EN.
- **Ekspektasi:** Label Pagination ikut berubah.
- **Prioritas:** P2

### Skenario 96 — Search spasi
- **Langkah:** Input hanya spasi.
- **Ekspektasi:** Dianggap kosong.
- **Prioritas:** P3

### Skenario 97 — Format ribuan besar
- **Langkah:** Total 1.000.000+.
- **Ekspektasi:** Pemisah ribuan benar.
- **Prioritas:** P3

### Skenario 98 — Print report
- **Langkah:** Print preview.
- **Ekspektasi:** Tabel rapi, header berulang.
- **Prioritas:** P3

### Skenario 99 — Enter di form login
- **Langkah:** Tekan Enter.
- **Ekspektasi:** Submit jalan.
- **Prioritas:** P3

### Skenario 100 — Back setelah logout
- **Langkah:** Logout lalu Back.
- **Ekspektasi:** Data sensitif tidak tampil tanpa session.
- **Prioritas:** P1
