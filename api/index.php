<?php

// Set Vercel environment flag
$_ENV['VERCEL'] = true;

// Create necessary directories in /tmp for Vercel's read-only filesystem
$directories = [
    '/tmp/storage',
    '/tmp/storage/logs',
    '/tmp/storage/framework',
    '/tmp/storage/framework/cache',
    '/tmp/storage/framework/sessions',
    '/tmp/storage/framework/views',
    '/tmp/bootstrap',
    '/tmp/bootstrap/cache',
];

foreach ($directories as $directory) {
    if (!is_dir($directory)) {
        mkdir($directory, 0755, true);
    }
}

// Forward Vercel requests to Laravel's public/index.php
require __DIR__ . '/../public/index.php';
