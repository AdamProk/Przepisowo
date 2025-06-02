<?php

// Create a default sample image as SVG
$sampleSvg = <<<SVG
<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="#f0f0f0"/>
    <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#646464" text-anchor="middle" dominant-baseline="middle">
        No Image
    </text>
</svg>
SVG;

file_put_contents(__DIR__ . '/uploads/default/sample.svg', $sampleSvg);

// Create a logo
$logoSvg = <<<SVG
<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="#05c435"/>
    <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">
        Recipe App
    </text>
</svg>
SVG;

file_put_contents(__DIR__ . '/uploads/default/logo.svg', $logoSvg);

echo "Default images created successfully!\n"; 