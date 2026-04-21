<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once 'helper.php';

$numero = isset($_GET['q']) ? trim($_GET['q']) : '';

if (strlen($numero) < 1) {
    echo json_encode([]);
    exit;
}

$url = 'http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/cercaNumeroTrenoTrenoAutocomplete/' . urlencode($numero);

$risposta = chiama_api($url);

if ($risposta === false || trim($risposta) === '') {
    echo json_encode([]);
    exit;
}

// formato risposta: "2946 - MILANO CENTRALE|S01700\n..."
$risultati = [];
foreach (explode("\n", trim($risposta)) as $riga) {
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
