<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once 'helper.php';

$codice = isset($_GET['codice']) ? trim($_GET['codice']) : '';

if (!$codice) {
    echo json_encode(['error' => 'codice stazione mancante']);
    exit;
}

$url = "http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/partenze/$codice/" . orario_trenitalia();

$risposta = chiama_api($url);

if ($risposta === false) {
    echo json_encode(['error' => 'errore api trenitalia']);
    exit;
}

$dati = json_decode($risposta, true);
echo json_encode($dati ?: []);
