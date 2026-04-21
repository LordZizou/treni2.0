<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once 'helper.php';

$url = 'http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/statistiche/0';

$risposta = chiama_api($url);

if ($risposta === false) {
    echo json_encode(['error' => 'errore api statistiche']);
    exit;
}

$dati = json_decode($risposta, true);
echo json_encode($dati ?: ['error' => 'dati non disponibili']);
