# Virtual Tour StarterKit

StarterKit open-source berbasis **Laravel 12** untuk membangun aplikasi Virtual Tour dengan fitur-fitur berikut:

- **Manajemen Virtual Tour, Sphere, dan Hotspot**  
- **Spatie Roles & Permissions** – Kontrol akses pengguna yang fleksibel  
- **Spatie Media Library** – Manajemen media (gambar sphere, dan lainnya)  
- **Dropzone JS** – Upload file modern  
- **DataTables** – Tabel dinamis dengan server-side processing & soft delete

---

## Daftar Isi

- [Requirements](#requirements)
- [Installation](#installation)
- [Database Setup & Seeders](#database-setup--seeders)
- [Virtual Tour Structure](#virtual-tour-structure)
- [Media Library Usage](#media-library-usage)
- [DataTables Integration](#datatables-integration)
- [Dropzone Usage](#dropzone-usage)
- [Running the Application](#running-the-application)
- [License](#license)

---

## Persyaratan

- PHP >= 8.0  
- Composer  
- Node.js & npm  
- Database (MySQL, PostgreSQL, dll)

---

## Instalasi

1. **Clone Repository**

  ```bash
  git clone https://github.com/RahmatRafiq/virtual-tour.git
  cd virtual-tour
  ```

2. **Install Dependensi PHP**

  ```bash
  composer install
  ```

3. **Install Dependensi Node**

  ```bash
  npm install
  ```

4. **Pengaturan Environment**

  Salin `.env.example` ke `.env` lalu sesuaikan konfigurasi database:

  ```bash
  cp .env.example .env
  ```

5. **Generate Application Key**

  ```bash
  php artisan key:generate
  ```

---

## Database Setup & Seeders

1. **Migrasi Database**

  ```bash
  php artisan migrate
  ```

2. **Seeder (Opsional)**

  Jalankan seeder untuk data awal (roles, permissions, dll):

  ```bash
  php artisan db:seed
  ```

---

## Struktur Virtual Tour

- **Virtual Tour**: Kategori utama tur virtual
- **Sphere**: Titik panorama dalam virtual tour (memiliki media gambar)
- **Hotspot**: Titik interaktif di sphere (navigasi antar sphere/informasi)

---

## Penggunaan Media Library

### Upload Gambar Sphere

Untuk upload gambar sphere, gunakan field `sphere_image` pada form Sphere.  
Media akan otomatis tersimpan ke koleksi media `sphere_image` pada model Sphere.

### Contoh di Controller

```php
// filepath: app/Http/Controllers/SphereController.php
if ($request->hasFile('sphere_image')) {
  MediaLibrary::put($sphere, 'sphere_image', $request, 'sphere_image');
}
```

---

## Integrasi DataTables

Gunakan komponen `DataTableWrapper` untuk menampilkan data Virtual Tour, Sphere, dan Hotspot dengan server-side processing.

### Contoh Penggunaan

```tsx
<DataTableWrapper
  ref={dtRef}
  ajax={{
   url: route('sphere.json') + '?filter=' + filter,
   type: 'POST',
   data: (d) => ({
    ...d,
    virtual_tour_id: virtualTourId === 'all' ? undefined : virtualTourId,
   }),
  }}
  columns={columns(filter)}
  options={{ drawCallback }}
/>
```

---

## Penggunaan Dropzone

Untuk upload media (gambar sphere, dll) gunakan helper Dropzoner.

### Contoh Inisialisasi Dropzone

```tsx
import { useEffect, useRef } from 'react';
import Dropzoner from '@/components/dropzoner';

const dropzoneRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (dropzoneRef.current) {
   Dropzoner(dropzoneRef.current, 'sphere_image', {
    urlStore: route('storage.store'),
    urlDestroy: route('sphere.deleteFile'),
    csrf: document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
    acceptedFiles: 'image/*',
    maxFiles: 1,
    files: [], // Preloaded files jika ada
    kind: 'image',
   });
  }
}, []);
```

---

## Menjalankan Aplikasi

1. **Jalankan Laravel Development Server dan Compile Assets (Dev Mode)**

  ```bash
  composer run dev
  ```

---

## Lisensi

MIT License.
. 