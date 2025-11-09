<?php
// Membuka tag PHP agar file ini dapat dieksekusi

/*
|--------------------------------------------------------------------------
| Create The Application
|--------------------------------------------------------------------------
|
| The first thing we will do is create a new Laravel application instance
| which serves as the "glue" for all the components of Laravel, and is
| the IoC container for the system binding all of the various parts.
|
*/

$app = new Illuminate\Foundation\Application(
// Membuat instance utama aplikasi Laravel
    $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
    // Menentukan path basis aplikasi dari variabel lingkungan atau folder induk
);
// Menyelesaikan pembuatan instance aplikasi

/*
|--------------------------------------------------------------------------
| Bind Important Interfaces
|--------------------------------------------------------------------------
|
| Next, we need to bind some important interfaces into the container so
| we will be able to resolve them when needed. The kernels serve the
| incoming requests to this application from both the web and CLI.
|
*/

$app->singleton(
// Mendaftarkan binding singleton untuk kernel HTTP
    Illuminate\Contracts\Http\Kernel::class,
    App\Http\Kernel::class
);
// Menentukan kernel HTTP yang akan menangani permintaan web

$app->singleton(
// Mendaftarkan binding singleton untuk kernel Console
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class
);
// Menentukan kernel console yang menjalankan command artisan

$app->singleton(
// Mendaftarkan binding singleton untuk handler pengecualian
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    App\Exceptions\Handler::class
);
// Menentukan class handler yang mengelola error dan exception

/*
|--------------------------------------------------------------------------
| Return The Application
|--------------------------------------------------------------------------
|
| This script returns the application instance. The instance is given to
| the calling script so we can separate the building of the instances
| from the actual running of the application and sending responses.
|
*/

return $app;
// Mengembalikan instance aplikasi agar dapat dijalankan oleh entry point
