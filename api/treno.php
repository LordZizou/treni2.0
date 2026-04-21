<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$numero = isset($_GET['numero']) ? trim($_GET['numero']) : '';
$origine = isset($_GET['origine']) ? trim($_GET['origine']) : '';

if (!$numero) {
    echo json_encode(['error' => 'numero treno mancante']);
    exit;
}

// se non ho il codice origine lo cerco con l'autocomplete
if (!$origine) {
    $urlCerca = 'http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/cercaNumeroTrenoTrenoAutocomplete/' . $numero;
    $risCerca = file_get_contents($urlCerca);

    if ($risCerca && trim($risCerca) !== '') {
        // la risposta e' tipo "2946 - MILANO CENTRALE|S01700\n"
        $righe = explode("\n", trim($risCerca));
        $prima = $righe[0];
        $parti = explode('|', $prima);
        if (count($parti) >= 2) {
            $origine = $parti[1];
        }
    }
}

if (!$origine) {
    echo json_encode(['error' => 'non trovo il treno']);
    exit;
}

// chiamo l'api per il percorso completo del treno
$url = "http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/andamentoTreno/$origine/$numero";

$risposta = file_get_contents($url);

if ($risposta === false) {
    echo json_encode(['error' => 'errore api']);
    exit;
}

$dati = json_decode($risposta, true);

if (!$dati) {
    echo json_encode(['error' => 'dati non trovati']);
    exit;
}

echo json_encode($dati);
