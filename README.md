# Velox POS — F&B Point of Sale & Microservices Ecosystem 🍕☕

[![React](https://img.shields.io/badge/React-19.2.7-blue.svg?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-~6.0.2-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.1.1-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-1.61.1-2EAD33.svg?style=flat&logo=playwright)](https://playwright.dev/)
[![Microservices Architecture](https://img.shields.io/badge/Architecture-Event--Driven%20Microservices-orange.svg)](#-microservices-architecture)

**Velox POS** adalah aplikasi Point of Sale (POS) Food & Beverage modern yang dirancang dengan antarmuka yang estetis dan berarsitektur **Modular Event-Driven Microservices**. Aplikasi ini mendukung alur kerja kasir, dapur (KDS), manajemen voucher promosi, serta rekonsiliasi shift kas yang berjalan mulus dan responsif di seluruh ukuran layar (Mobile, Tablet, dan Desktop).

---

## ✨ Fitur Utama

### 🔐 1. Role-Based Access Control (RBAC) & Authentication
- **Role Owner**: Memiliki hak akses penuh untuk mengelola dan memonitor seluruh modul (Dashboard, Menu Management, Vouchers & Promo, Order / POS, KDS / Kitchen, dan Shift).
- **Role Kasir**: Akses difokuskan pada alur operasional utama (**Order / POS**, **KDS / Kitchen**, dan **Shift**). Menu yang tidak dapat diakses disembunyikan sepenuhnya (*hidden navigation*) di seluruh mode layar untuk menjaga kesederhanaan dan fokus operasional.
- **Microservices Auth Gateway**: Simulasi *token-based identity* dengan perlindungan *route guard* interaktif.

### 🛒 2. Order & Payment POS Engine
- **Meja & Order Type Selection**: Pemilihan mode *Dine-In* (lengkap dengan nomor meja) atau *Takeaway*.
- **Katalog Menu Interaktif**: Kategori dinamis dengan pencarian real-time, kustomisasi *modifiers* (tingkat keleluasaan gula/es/topping), dan catatan khusus per item.
- **Smart Cart Summary**: Kalkulasi subtotal, diskon voucher otomatis, perhitungan pajak (10% PB1), dan kembalian tunai secara instan.
- **Struk Digital / Receipt Verification**: Struk pembelian yang siap dicetak dengan rincian transaksi lengkap dan ID pesanan unik.

### 🍳 3. Kitchen Display System (KDS)
- **Real-Time Order Synchronization**: Pesanan dari layar POS langsung masuk ke papan dapur secara instan melalui sistem *Event Bus* internal.
- **Interactive Ticket Workflow**: Tracking status pengerjaan per item per meja (dari `Pending` → `Preparation` → `Ready` / `Served`).

### 🎟️ 4. Voucher Management Dashboard & Live POS Redemption
- **Manajemen Promo / Voucher**: Dashboard khusus bagi Owner untuk membuat dan mengelola kode kupon diskon (tipe **Fixed Nominal (Rp)** atau **Persentase (%)**, minimum order, serta kuota pemakaian).
- **Live POS Redemption**: Kasir dapat langsung memasukkan kode promo pada saat transaksi di layar POS dengan validasi otomatis terhadap kuota dan syarat minimum transaksi.

### 🕒 5. Shift Reconciliation & Cash Flow Monitoring
- **Opening & Closing Cash Management**: Pencatatan kas awal shift, kalkulasi otomatis penerimaan kas dari penjualan (`System Cash Sales`), dan rekonsiliasi kas akhir (`Actual Cash Submitted`).
- **Discrepancy Reporting**: Perhitungan selisih kas (*overage/shortage*) dan input catatan audit shift.

---

## 🏗️ Arsitektur Microservices (Event-Driven Gateway)

Velox POS dibangun di atas konsep **Frontend Microservices Gateway** dengan adapter independen yang berkomunikasi melalui *Internal Event Bus*:

```
+-----------------------------------------------------------------------+
|                         VELOX POS GATEWAY                             |
+-----------------------------------------------------------------------+
        |                  |                 |                  |
        v                  v                 v                  v
 +--------------+   +--------------+  +--------------+   +--------------+
 |  AuthService |   |  MenuService |  | OrderService |   | VoucherServ  |
 +--------------+   +--------------+  +--------------+   +--------------+
        ^                                    ^                  ^
        |                                    |                  |
        +------------------+-----------------+------------------+
                           |
                           v
                +----------------------+
                |  Event Bus / Memory  |  <--- persistence: velox_db_v1
                +----------------------+
                           ^
                           |
            +--------------+--------------+
            |                             |
            v                             v
     +--------------+              +--------------+
     |  KdsService  |              | ShiftService |
     +--------------+              +--------------+
```

### Keunggulan Arsitektur:
- **Decoupled Modules**: Setiap servis (`AuthService`, `OrderService`, `PaymentService`, `KdsService`, `VoucherService`, `ShiftService`) memiliki *state*, validasi, dan logika bisnis mandiri.
- **Persistence Storage (`velox_db_v1`)**: Penyimpanan lokal berbasis `localStorage` terstruktur sehingga data transaksi dan konfigurasi tetap tersimpan saat aplikasi dimuat ulang.
- **DevMode Error Simulation**: Dilengkapi dengan simulator gangguan jaringan dan pemulihan otomatis (*fault tolerance recovery*) guna menguji ketahanan antarmuka saat terjadi kegagalan servis.

---

## 📱 Sistem Desain Responsif (3-Tier Layout System)

Aplikasi dirancang agar secara dinamis menyesuaikan diri di berbagai perangkat POS:

| Viewport Mode | Lebar Layar | Karakteristik Tata Letak |
|---|---|---|
| **🖥️ Desktop** | `> 1024px` | Sidebar penuh kiri (`216px`) dengan label & ikon + kolom keranjang pesanan (*Cart Drawer*) statis di sebelah kanan. |
| **📱 Tablet** | `640px – 1024px` | Sidebar ringkas *Icon Rail* (`68px`) + *slide-up bottom drawer* untuk keranjang pesanan. |
| **☎️ Mobile** | `< 640px` | *Top Brand Header* + *Fixed Bottom Navigation Bar* (ikon operasional) + *Floating Order Summary Pill* yang memicu *Slide-up Cart Sheet*. |

---

## 🧪 Comprehensive Quality Assurance Suite (Playwright)

Proyek ini dilengkapi dengan **44 pengujian terotomatisi** yang mencakup pengujian fungsional, visual, dan aksesibilitas lintas peramban (**Chromium & Firefox**).

### 1. 🚀 End-to-End Functional Test Suite (Flow 1–9)
- **E2E Flow 1**: Auth Service & Role-Based Access Control (RBAC).
- **E2E Flow 2**: Order & Payment Microservices Integration.
- **E2E Flow 3**: DevMode Microservice Gateway Error Simulation & Recovery.
- **E2E Flow 4**: URL Path Routing & Deep-Link Persistence (`react-router-dom`).
- **E2E Flow 5**: Voucher Promo Application & KDS Real-time Workflow.
- **E2E Flow 6**: Voucher Management Dashboard & Live POS Redemption Verification.
- **E2E Flow 7**: Mobile Viewport Navigation & POS Slide-up Cart Drawer (`iPhone 13`).
- **E2E Flow 8**: Tablet Viewport Icon Rail & Layout Scaling (`iPad Air`).
- **E2E Flow 9**: Desktop Viewport Expanded Sidebar & Static Right Cart Column (`MacBook Pro`).

### 2. 🎨 Visual Regression Testing
Memverifikasi stabilitas antarmuka (*pixel-by-pixel tolerance 2%*) pada seluruh layar (`Dashboard`, `Menu`, `Vouchers / Promo`, `Order / POS`, `KDS / Kitchen`, `Shift`) serta memastikan pembatasan tampilan navigasi untuk role Kasir bekerja dengan sempurna.

### 3. ♿ Accessibility Auditing (WCAG 2.0 Level AA)
Terintegrasi langsung dengan `@axe-core/playwright` untuk melakukan audit aksesibilitas otomatis pada seluruh antarmuka guna mencegah pelanggaran kritis (*critical a11y violations*).

---

## 🚀 Panduan Memulai (Getting Started)

### Prasyarat
Pastikan Anda telah menginstal **Node.js** (v18 atau lebih baru) dan **npm** di lingkungan pengembangan Anda.

### 1. Instalasi Dependencies
```bash
npm install
```

### 2. Menjalankan Development Server
Jalankan server lokal dengan fitur *Hot Module Replacement* (HMR):
```bash
npm run dev
```
Aplikasi akan dapat diakses di URL default: `http://localhost:5173`.

### 3. Membangun Bundle Produksi
Untuk memeriksa tipe TypeScript dan menghasilkan bundle produksi yang optimal:
```bash
npm run build
```

---

## 🛠️ Menjalankan Pengujian Otomatis (Testing Commands)

### Menjalankan Seluruh Pengujian (Multi-Browser Chromium + Firefox)
```bash
npx playwright test
```

### Menjalankan Pengujian di Chromium Saja (Lebih Cepat)
```bash
npx playwright test --project=chromium
```

### Memperbarui Golden Snapshots (Visual Regression)
Jika terjadi perubahan desain UI yang sengaja dilakukan:
```bash
npx playwright test e2e/visual-regression.spec.ts --update-snapshots
```

### Melihat Laporan Pengujian Interaktif HTML
Setelah pengujian selesai dijalankan, lihat laporan lengkap (beserta *trace zip*, *screenshot*, dan *video recording* jika terjadi kegagalan):
```bash
npx playwright show-report
```

---

## 👨‍💻 Kontributor / Author
Dibuat dan dikembangkan oleh:
**Hafizh Asy'ari** (<hafizhasyari@gmail.com>)
