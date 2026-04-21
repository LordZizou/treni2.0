<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once 'helper.php';

$testo = isset($_GET['q']) ? trim($_GET['q']) : '';

if (strlen($testo) < 2) {
    echo json_encode([]);
    exit;
}

// chiamo l'api autocomplete stazioni
$url = 'http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/cercaStazione/' . urlencode($testo);

$risposta = chiama_api($url);

if ($risposta === false) {
    echo json_encode(['error' => 'errore chiamata api']);
    exit;
}

$dati = json_decode($risposta, true);
echo json_encode($dati ?: []);
