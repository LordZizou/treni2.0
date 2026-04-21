<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// chiamo l'api statistiche di trenitalia
$url = 'http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/statistiche/0';

$risposta = file_get_contents($url);

if ($risposta === false) {
    echo json_encode(['error' => 'errore api statistiche']);
    exit;
}

$dati = json_decode($risposta, true);

if (!$dati) {
    echo json_encode(['error' => 'dati non disponibili']);
    exit;
}

echo json_encode($dati);
