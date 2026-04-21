<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$citta = isset($_GET['citta']) ? trim($_GET['citta']) : '';

if (!$citta) {
    echo json_encode(['error' => 'citta mancante']);
    exit;
}

// chiave api openweathermap (gratuita)
$apiKey = 'bd5e378503941ddeba110f3b3b4a7cc4'; // chiave demo pubblica

// chiamo openweathermap
$url = "https://api.openweathermap.org/data/2.5/weather?q=" . urlencode($citta) . "&appid=$apiKey&units=metric&lang=it";

$ctx = stream_context_create(['http' => ['timeout' => 5]]);
$risposta = file_get_contents($url, false, $ctx);

if ($risposta === false) {
    echo json_encode(['error' => 'meteo non disponibile']);
    exit;
}

$dati = json_decode($risposta, true);

if (!$dati || $dati['cod'] != 200) {
    echo json_encode(['error' => 'citta non trovata']);
    exit;
}

// mando solo quello che mi serve
$risultato = [
    'temp' => round($dati['main']['temp']),
    'descrizione' => $dati['weather'][0]['description'],
    'icona' => $dati['weather'][0]['icon'],
    'min' => round($dati['main']['temp_min']),
    'max' => round($dati['main']['temp_max'])
];

echo json_encode($risultato);
