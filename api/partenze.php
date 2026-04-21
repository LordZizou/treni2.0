<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$codice = isset($_GET['codice']) ? trim($_GET['codice']) : '';

if (!$codice) {
    echo json_encode(['error' => 'codice stazione mancante']);
    exit;
}

// orario attuale nel formato che vuole trenitalia
$orario = date('D+MMM+d+Y+H:i:00', time());
// formato corretto es: Mon+Apr+21+2025+13:00:00
$orario = rawurlencode(date('D') . '+' . date('M') . '+' . date('d') . '+' . date('Y') . '+' . date('H:i:s'));

// chiamo l'api partenze
$url = "http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/partenze/$codice/" . $orario;

$risposta = file_get_contents($url);

if ($risposta === false) {
    echo json_encode(['error' => 'errore api trenitalia']);
    exit;
}

$dati = json_decode($risposta, true);

if (!$dati) {
    echo json_encode([]);
    exit;
}

echo json_encode($dati);
