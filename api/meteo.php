<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once 'helper.php';

$citta = isset($_GET['citta']) ? trim($_GET['citta']) : '';

if (!$citta) {
    echo json_encode(['error' => 'citta mancante']);
    exit;
}

$apiKey = 'bd5e378503941ddeba110f3b3b4a7cc4';
$url = "https://api.openweathermap.org/data/2.5/weather?q=" . urlencode($citta) . "&appid=$apiKey&units=metric&lang=it";

$risposta = chiama_api($url);

if ($risposta === false) {
    echo json_encode(['error' => 'meteo non disponibile']);
    exit;
}

$dati = json_decode($risposta, true);

if (!$dati || $dati['cod'] != 200) {
    echo json_encode(['error' => 'citta non trovata']);
    exit;
}

echo json_encode([
    'temp' => round($dati['main']['temp']),
    'descrizione' => $dati['weather'][0]['description'],
    'icona' => $dati['weather'][0]['icon'],
    'min' => round($dati['main']['temp_min']),
    'max' => round($dati['main']['temp_max'])
]);
