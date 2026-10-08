# Lost & Founds (ReactJS)

Aplikasi pelaporan barang hilang dan temuan. Data diambil dari [Delcom Open API (Lost & Founds)](https://open-api.delcom.org/docs/1.0/api-lost-founds). Proyek ini adalah bagian ReactJS dari studi kasus Praktikum PABWE 4 (2026).

## Teknologi

| Bagian | Yang dipakai |
|---|---|
| Runtime dan package manager | Bun |
| Framework | React (JavaScript) dengan Vite |
| Routing | react-router-dom |
| State management | Redux Toolkit dan react-redux |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`), font Plus Jakarta Sans (Google Fonts) |
| Ikon | `@tabler/icons-react` |
| Dialog | SweetAlert2 |
| Pengujian | Vitest, jsdom, Testing Library, coverage v8 |

## Fitur

- **Autentikasi**: registrasi dan login dengan validasi form, token disimpan di `localStorage`, logout dengan dialog konfirmasi.
- **Route guard**: halaman dashboard hanya bisa dibuka dengan token yang valid. Jika profil gagal dimuat, pengguna dialihkan ke halaman login.
- **Laporan Lost & Founds**: daftar laporan, filter jenis (`status`), filter status selesai (`is_completed`), filter laporan milik sendiri (`is_me`), pencarian kata kunci, tambah, ubah, ganti cover (dengan pratinjau), dan hapus.
- **Statistik**: ringkasan Total, Barang Hilang, Barang Ditemukan, dan Selesai di halaman beranda.
- **Pengguna dan profil**: daftar pengguna dengan pencarian, ubah nama dan email, unggah foto profil, dan ganti kata sandi.
- **Responsif**: sidebar menjadi drawer di layar kecil.

## Prasyarat

- [Bun](https://bun.sh) terpasang (`bun --version`)

## Menjalankan Proyek

```bash
# 1. Pasang dependensi
bun install

# 2. Buat berkas lingkungan dari contoh
cp .env.example .env

# 3. Jalankan server pengembangan
bun run dev
```

Aplikasi berjalan di `http://localhost:3000` (port diambil dari `APP_PORT`).

## Variabel Lingkungan

| Variabel | Fungsi | Contoh |
|---|---|---|
| `DELCOM_BASEURL` | URL dasar API Delcom | `https://open-api.delcom.org/api/v1` |
| `APP_PORT` | Port server pengembangan dan preview | `3000` |

`.env.example` hanya berisi contoh format. Nilai untuk Delcom ada di bagian atas. `.env` masuk `.gitignore` dan tidak boleh di-commit.

Di `vite.config.js`, `DELCOM_BASEURL` dibaca lewat `loadEnv` dan disediakan ke kode sebagai konstanta global (`define`). Jika variabel tidak ada, nilai bawaannya `https://open-api.delcom.org/api/v1`. Karena itu konstanta ini didaftarkan sebagai global `readonly` di `eslint.config.js`.

## Perintah

| Perintah | Fungsi |
|---|---|
| `bun run dev` | Server pengembangan |
| `bun run build` | Build produksi ke folder `dist` |
| `bun run preview` | Menjalankan hasil build secara lokal |
| `bun run lint` | Memeriksa kode dengan ESLint |
| `bun run test` | Menjalankan seluruh tes satu kali |
| `bun run test:watch` | Menjalankan tes dalam mode watch |
| `bun run test:coverage` | Menjalankan tes beserta laporan coverage |

## Rute

| Rute | Halaman | Layout |
|---|---|---|
| `/auth/login` | Login | `AuthLayout` |
| `/auth/register` | Registrasi | `AuthLayout` |
| `/` | Beranda: statistik, filter, dan daftar laporan | `LostFoundLayout` (terproteksi) |
| `/lost-founds/:id` | Detail laporan | `LostFoundLayout` (terproteksi) |
| `/users` | Daftar pengguna | `LostFoundLayout` (terproteksi) |
| `/profile` | Profil dan pengaturan akun | `LostFoundLayout` (terproteksi) |

## Endpoint API yang Dipakai

Semua permintaan lewat `apiHelper.fetchData`, yang menambahkan header `Authorization: Bearer <token>` jika token tersimpan.

| Modul | Endpoint |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/register` |
| Users | `GET /users`, `GET /users/me`, `PUT /users/me`, `POST /users/me/photo`, `PUT /users/me/password` |
| Lost & Founds | `GET /lost-founds` (filter `status`, `is_completed`, `is_me`), `GET /lost-founds/:id`, `POST /lost-founds`, `PUT /lost-founds/:id`, `POST /lost-founds/:id/cover`, `DELETE /lost-founds/:id`, `GET /lost-founds/stats/daily`, `GET /lost-founds/stats/monthly` |

Logout dilakukan di sisi klien (token dihapus dan state direset), tanpa memanggil endpoint.

## Struktur Proyek

```
src/
├── App.jsx                  # Deklarasi rute
├── main.jsx                 # Provider Redux dan BrowserRouter
├── store.js                 # configureStore; mengekspor `reducer` untuk test-utils
├── test-utils.jsx           # renderWithProviders (Redux Provider + MemoryRouter)
├── setupTests.js            # Setup jest-dom untuk Vitest
├── helpers/
│   ├── apiHelper.js         # fetchData, buildQuery, getAccessToken, putAccessToken
│   └── toolsHelper.js       # Dialog SweetAlert2, formatDate, getImageUrl
├── hooks/
│   └── useInput.js          # Hook untuk state input form
└── features/
    ├── auth/                # api, layouts, pages, states
    ├── users/               # api, pages, states
    └── lost-founds/         # api, components, layouts, modals, pages, states
```

Setiap modul fitur memakai pola yang sama:

- `api/`: fungsi pemanggil endpoint.
- `states/action.js`: action types, action creators, dan async thunk.
- `states/reducer.js`: reducer untuk tiap potongan state.
- Berkas `*.test.js(x)` berada di samping berkas yang diuji.

## Pengujian

`vite.config.js` mewajibkan coverage 100% untuk `lines`, `functions`, `branches`, dan `statements`. Perintah berikut gagal jika ada yang di bawah itu:

```bash
bun run test:coverage
```

Berkas yang dikecualikan dari coverage: `src/main.jsx`, `src/setupTests.js`, `src/test-utils.jsx`, dan berkas tes itu sendiri.

Pendekatan pengujian:

- **API dan thunk**: `apiHelper`, `authApi`, dan sejenisnya di-*mock*, sehingga tidak ada permintaan jaringan sungguhan.
- **Komponen dan halaman**: dirender dengan `renderWithProviders` di store Redux asli, dan state awal diatur lewat `preloadedState`.
- **Layout dan App**: modal serta halaman anak diganti stub supaya tes fokus pada perilaku layout atau rute.

## Struktur Singkat Alur Data

1. Komponen memanggil async thunk (misalnya `asyncSetLostFounds`).
2. Thunk memanggil fungsi di `api/`, lalu menampilkan dialog jika perlu.
3. Thunk mengirim action ke store, dan reducer memperbarui state.
4. Komponen membaca state lewat `useSelector`.

Pasangan state seperti `isLostFoundAdd` dan `isLostFoundAdded` dipakai begini: yang pertama menandai proses sedang berjalan (tombol dinonaktifkan), yang kedua menandai proses berhasil (modal menutup dan data dimuat ulang).

## Catatan

- Foto profil dan cover berupa path relatif dari API. `getImageUrl` membentuk URL lengkap dari `DELCOM_BASEURL` dengan menghapus bagian `/api/v1`.
- Statistik di beranda dijumlahkan dari data endpoint `stats/monthly` tanpa parameter. Cakupan bulannya mengikuti nilai bawaan API.