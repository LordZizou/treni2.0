<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// prendo il testo che ha scritto l'utente
$testo = isset($_GET['q']) ? trim($_GET['q']) : '';

if (strlen($testo) < 2) {
    echo json_encode([]);
    exit;
}

// chiamo l'api di trenitalia per l'autocomplete stazioni
$url = 'http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/cercaStazione/' . urlencode($testo);

$risposta = file_get_contents($url);

if ($risposta === false) {
    echo json_encode(['error' => 'errore chiamata api']);
    exit;
}

$dati = json_decode($risposta, true);

if (!$dati) {
    echo json_encode([]);
    exit;
}

// restituisco i dati al frontend
echo json_encode($dati);
