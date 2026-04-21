<?php
// chiama un endpoint esterno con curl
function chiama_api($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
    $risposta = curl_exec($ch);
    $errore = curl_error($ch);
    curl_close($ch);
    if ($errore || $risposta === false) return false;
    return $risposta;
}

// data nel formato che vuole trenitalia: Mon+Apr+21+2025+13%3A00%3A00
function orario_trenitalia() {
    return date('D') . '+' . date('M') . '+' . date('d') . '+' . date('Y') . '+' . rawurlencode(date('H:i:s'));
}
