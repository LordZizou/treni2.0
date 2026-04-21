<?php
// connessione al database
$host = 'localhost';
$dbname = 'binario_live';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // se non riesce a connettersi restituisce errore json
    header('Content-Type: application/json');
    echo json_encode(['error' => 'db error: ' . $e->getMessage()]);
    exit;
}
