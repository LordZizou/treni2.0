<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$numero = isset($_GET['q']) ? trim($_GET['q']) : '';

if (strlen($numero) < 1) {
    echo json_encode([]);
    exit;
}

// chiamo l'autocomplete per numero treno
$url = 'http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/cercaNumeroTrenoTrenoAutocomplete/' . urlencode($numero);

$risposta = file_get_contents($url);

if ($risposta === false || trim($risposta) === '') {
    echo json_encode([]);
    exit;
}

// il formato e' "2946 - MILANO CENTRALE|S01700\n2946 - ..."
$risultati = [];
$righe = explode("\n", trim($risposta));

foreach ($righe as $riga) {
    if (trim($riga) === '') continue;
    $parti = explode('|', $riga);
    if (count($parti) >= 2) {
        $info = explode(' - ', $parti[0]);
        $risultati[] = [
            'numero' => trim($info[0]),
            'origine_nome' => isset($info[1]) ? trim($info[1]) : '',
            'origine_codice' => trim($parti[1])
        ];
    }
}

echo json_encode($risultati);
