<?php

return [
    // Server key from Midtrans Dashboard
    'server_key' => env('MIDTRANS_SERVER_KEY', ''),

    // Client key for Snap.js (if used on frontend)
    'client_key' => env('MIDTRANS_CLIENT_KEY', ''),

    // false for sandbox, true for production
    'is_production' => (bool) env('MIDTRANS_IS_PRODUCTION', false),

    // Optional recommended settings
    'is_sanitized' => (bool) env('MIDTRANS_IS_SANITIZED', true),
    'is_3ds' => (bool) env('MIDTRANS_IS_3DS', true),
];

