<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$codice = isset($_GET['codice']) ? trim($_GET['codice']) : '';

if (!$codice) {
    echo json_encode(['error' => 'codice stazione mancante']);
    exit;
}

// stessa cosa delle partenze ma endpoint arrivi
$orario = rawurlencode(date('D') . '+' . date('M') . '+' . date('d') . '+' . date('Y') . '+' . date('H:i:s'));

$url = "http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/arrivi/$codice/" . $orario;

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
