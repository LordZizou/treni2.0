<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once 'helper.php';

$numero = isset($_GET['numero']) ? trim($_GET['numero']) : '';
$origine = isset($_GET['origine']) ? trim($_GET['origine']) : '';

if (!$numero) {
    echo json_encode(['error' => 'numero treno mancante']);
    exit;
}

// se non ho il codice origine lo cerco in automatico
if (!$origine) {
    $urlCerca = 'http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/cercaNumeroTrenoTrenoAutocomplete/' . $numero;
    $risCerca = chiama_api($urlCerca);

    if ($risCerca && trim($risCerca) !== '') {
        $righe = explode("\n", trim($risCerca));
        $parti = explode('|', $righe[0]);
        if (count($parti) >= 2) {
            $origine = trim($parti[1]);
        }
    }
}

if (!$origine) {
    echo json_encode(['error' => 'non trovo il treno']);
    exit;
}

$url = "http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/andamentoTreno/$origine/$numero";

$risposta = chiama_api($url);

if ($risposta === false) {
    echo json_encode(['error' => 'errore api']);
    exit;
}

$dati = json_decode($risposta, true);
echo json_encode($dati ?: ['error' => 'dati non trovati']);
