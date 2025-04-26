<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\SocialAuthController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Route for login with OAuth (Google, GitHub)
Route::get('auth/{provider}', [SocialAuthController::class, 'redirectToProvider'])->name('auth.redirect');
Route::get('auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback'])->name('auth.callback');

// Middleware for pages that require authentication
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::delete('/settings/profile/delete-file', [\App\Http\Controllers\Settings\ProfileController::class, 'deleteFile'])->name('profile.deleteFile');
    Route::post('/settings/profile/upload', [\App\Http\Controllers\Settings\ProfileController::class, 'upload'])->name('profile.upload');
    Route::post('/temp/storage', [\App\Http\Controllers\StorageController::class, 'store'])->name('storage.store');
    Route::delete('/temp/storage', [\App\Http\Controllers\StorageController::class, 'destroy'])->name('storage.destroy');
    Route::get('/temp/storage/{path}', [\App\Http\Controllers\StorageController::class, 'show'])->name('storage.show');

    Route::post('roles/json', [\App\Http\Controllers\UserRolePermission\RoleController::class, 'json'])->name('roles.json');
    Route::resource('roles', \App\Http\Controllers\UserRolePermission\RoleController::class);

    Route::post('permissions/json', [\App\Http\Controllers\UserRolePermission\PermissionController::class, 'json'])->name('permissions.json');
    Route::resource('permissions', \App\Http\Controllers\UserRolePermission\PermissionController::class);

    Route::post('users/json', [\App\Http\Controllers\UserRolePermission\UserController::class, 'json'])->name('users.json');
    Route::resource('users', \App\Http\Controllers\UserRolePermission\UserController::class);
    Route::get('users/trashed', [\App\Http\Controllers\UserRolePermission\UserController::class, 'trashed'])->name('users.trashed');
    Route::post('users/{user}/restore', [\App\Http\Controllers\UserRolePermission\UserController::class, 'restore'])->name('users.restore');
    Route::delete('users/{user}/force-delete', [\App\Http\Controllers\UserRolePermission\UserController::class, 'forceDelete'])->name('users.force-delete');

    Route::post('logout', [SocialAuthController::class, 'logout'])->name('logout');

});
Route::get('/dashboard/activity-logs', function () {
    return Inertia::render('ActivityLogList');
})->middleware(['auth']);

Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-log.index');
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

// "datatables.net": "^2.2.2",
// "datatables.net-dt": "^2.2.2",
// "datatables.net-react": "^1.0.0",
// "jquery": "^3.7.1",
