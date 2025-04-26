# Laravel 12 Spatie Media & Roles StarterKit

An open-source starter kit built with **Laravel 12** to jumpstart your web development projects. This kit comes packed with powerful features including:

- **Spatie Roles & Permissions** – Robust user access control.
- **Spatie Media Library** – Seamless media management.
- **Dropzone JS** – Modern, user-friendly file uploads.
- **DataTables (from datatables.net)** – Advanced table features with server-side processing and soft delete support.

Built in just **29 hours over 5 days**, this starter kit is designed to help you hit the ground running!

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Database Setup & Seeders](#database-setup--seeders)
- [Media Library Usage](#media-library-usage)
- [DataTables Integration](#datatables-integration)
- [Dropzone Usage](#dropzone-usage)
- [Running the Application](#running-the-application)
- [License](#license)

---

## Requirements

- PHP >= 8.0  
- Composer  
- Node.js & npm  
- A database (MySQL, PostgreSQL, etc.)

---

## Installation

1. **Clone the Repository**

    ```bash
    git clone https://github.com/RahmatRafiq/laravel-12-spattie-media-and-roles.git
    cd laravel-12-spattie-media-and-roles
    ```

2. **Install PHP Dependencies**

    ```bash
    composer install
    ```

3. **Install Node Dependencies**

    ```bash
    npm install
    ```

4. **Environment Setup**

    Copy the `.env.example` file to create your own `.env` file:

    ```bash
    cp .env.example .env
    ```

    Then, update your `.env` file with your database and other configuration settings.

5. **Generate Application Key**

    ```bash
    php artisan key:generate
    ```

---

## Database Setup & Seeders

1. **Run Migrations**

    Migrate the database tables:

    ```bash
    php artisan migrate
    ```

2. **Run Seeders (Optional)**

    If you have seeders configured for roles, permissions, or test data, run:

    ```bash
    php artisan db:seed
    ```

    Note: Ensure your seeders are correctly configured to populate roles, permissions, and any necessary data.

---

## Media Library Usage

### Uploading a Profile Image

To upload a profile image, send a POST request to the upload endpoint with these fields:

- `profile-images.*`: Required file(s) (max size: 2MB; allowed types: jpeg, jpg, png)
- `id`: The user ID (integer)

Example controller method:

```php
public function upload(Request $request)
{
     $request->validate([
          'profile-images.*' => 'required|file|max:2048|mimes:jpeg,jpg,png',
          'id'               => 'required|integer',
     ]);

     $user = $request->user();
     $file = $request->file('profile-images')[0];
     $filePath = Storage::disk('temp')->putFile('', $file);
     $media = $user->addMediaFromDisk($filePath, 'temp')->toMediaCollection('profile-images');
     Storage::disk('temp')->delete($filePath);

     return response()->json([
            'name' => $media->file_name,
            'url'  => $media->getFullUrl()
     ], 200);
}
```

### Updating a User's Profile (Including Media)

Example controller method for updating a profile with media updates:

```php
public function update(ProfileUpdateRequest $request): RedirectResponse
{
     DB::beginTransaction();

     try {
          $request->validate([
                'profile-images' => 'array|max:3',
          ]);

          $user = $request->user();
          $user->fill($request->validated());

          if ($user->isDirty('email')) {
                $user->email_verified_at = null;
          }

          if ($request->has('profile-images')) {
                $profileImages = $request->input('profile-images');
                if (is_array($profileImages) && count($profileImages) > 0) {
                     $lastImage = end($profileImages);
                     $request->merge(['profile-images' => [$lastImage]]);
                }

                MediaLibrary::put(
                     $user,
                     'profile-images',
                     $request,
                     'profile-images'
                );
          }

          $user->save();
          DB::commit();
          return to_route('profile.edit');
     } catch (\Exception $e) {
          DB::rollBack();
          \Log::error('Profile update error: ' . $e->getMessage());
          return back()->withErrors(['error' => 'Profile update failed.']);
     }
}
```

---

## DataTables Integration

This starter kit comes with a custom `DataTableWrapper` component built on top of DataTables.net that supports:

- Server-Side Pagination & Ordering – Leveraging Laravel's pagination.
- Custom Render Functions – Easily render action buttons (Edit, Delete, etc.) with custom functions.
- Reload API – Refresh table data without a full page reload via the `reload()` method provided by `DataTableWrapperRef`.

Example usage in a component:

```tsx
<DataTableWrapper
  ref={dtRef}
  ajax={{
     url: route('users.json') + '?filter=' + filter,
     type: 'POST',
  }}
  columns={columns(filter)}
  options={{ drawCallback }}
/>
```

Note: The JSON endpoint eagerly loads the roles relation to optimize queries.

---

## Dropzone Usage

This starter kit uses Dropzone JS for modern file uploads. The integration is handled by a custom helper (`Dropzoner`) that simplifies initialization and event handling.

### Steps to Use Dropzone:

1. **Import Dropzone and Toastify**

    ```typescript
    import Dropzone from 'dropzone';
    import 'dropzone/dist/dropzone.css';
    import Toastify from 'toastify-js';
    import 'toastify-js/src/toastify.css';
    ```

2. **Initialize Dropzone**

    Example helper function:

    ```typescript
    import Dropzone from 'dropzone';

    Dropzone.autoDiscover = false;

    interface FileData {
      file_name: string;
      size: number;
      original_url: string;
    }

    interface DropzoneOptions {
      urlStore: string;
      urlDestroy: string;
      csrf: string;
      acceptedFiles: string;
      files?: FileData[];
      maxFiles: number;
      kind: string;
    }

    const Dropzoner = (
      element: HTMLElement | null,
      key: string,
      { urlStore, urlDestroy, csrf, acceptedFiles, files, maxFiles, kind }: DropzoneOptions
    ): Dropzone => {
      if (!element) throw new Error('Element not found');
      if (!urlStore) throw new Error('URL Store not found');
      if (!csrf) throw new Error('CSRF token not found');
      if (!acceptedFiles) throw new Error('Accepted Files not specified');
      if (!maxFiles) throw new Error('Max Files not specified');
      if (!kind) throw new Error('Kind not specified');

      const myDropzone = new Dropzone(element, {
         url: urlStore,
         headers: { 'X-CSRF-TOKEN': csrf },
         acceptedFiles: acceptedFiles,
         maxFiles: maxFiles,
         addRemoveLinks: true,
         init: function () {
            if (files) {
              files.forEach(file => {
                 const mockFile = {
                    name: file.file_name,
                    size: file.size,
                    accepted: true,
                    upload: { filename: file.file_name, size: file.size },
                    dataURL: file.original_url
                 } as unknown as Dropzone.DropzoneFile;

                 this.emit('addedfile', mockFile);
                 this.emit('thumbnail', mockFile, file.original_url);
                 this.emit('complete', mockFile);

                 const input = document.createElement('input');
                 input.type = 'hidden';
                 input.name = `${key}[]`;
                 input.value = file.file_name;
                 mockFile.previewElement?.appendChild(input);
              });
            }
         },
         success: function (file: Dropzone.DropzoneFile) {
            const response = file.xhr ? JSON.parse(file.xhr.responseText) : {};
            if (response && file.upload) {
              (file.upload as any).filename = response.name;
              (file.upload as any).size = response.size;
            }
         },
         removedfile: function (file) {
            fetch(urlDestroy, {
              method: 'DELETE',
              headers: {
                 'X-CSRF-TOKEN': csrf,
                 'Content-Type': 'application/json'
              },
              body: JSON.stringify({ filename: file.name })
            })
              .then(res => res.json())
              .then(data => console.log(data))
              .catch(error => console.error(error));

            file.previewElement?.parentNode?.removeChild(file.previewElement);
         },
         error: function (file, message: string | Error) {
            const errorMessage = message instanceof Error ? message.message : message;
            Toastify({
              text: errorMessage,
              className: 'error',
              duration: 5000
            }).showToast();
            file.previewElement?.parentNode?.removeChild(file.previewElement);
         },
      });

      return myDropzone;
    };

    export default Dropzoner;
    ```

### Usage in a Component

Import and initialize Dropzone in your component, for example:

```tsx
import { useEffect, useRef } from 'react';
import Dropzoner from '@/components/dropzoner';

const dropzoneRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (dropzoneRef.current) {
     Dropzoner(dropzoneRef.current, 'profile-images', {
        urlStore: route('storage.store'),
        urlDestroy: route('profile.deleteFile'),
        csrf: document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        acceptedFiles: 'image/*',
        maxFiles: 3,
        files: [], // Preloaded files if any
        kind: 'image',
     });
  }
}, []);
```

---

## Running the Application

1. **Start the Laravel Development Server**

    ```bash
    php artisan serve
    ```

    Then open your browser and navigate to http://localhost:8000.

2. **Compile Assets During Development**

    For asset compilation and live-reloading during development, run:

    ```bash
    npm run dev
    ```

---

## License

This project is open-source and available under the MIT License.
#   v i r t u a l - t o u r  
 