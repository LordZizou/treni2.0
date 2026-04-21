-- tabella per salvare le stazioni cercate di recente
CREATE DATABASE IF NOT EXISTS binario_live CHARACTER SET utf8 COLLATE utf8_general_ci;

USE binario_live;

CREATE TABLE IF NOT EXISTS stazioni_recenti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codice VARCHAR(20) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    cercata_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (codice)
);

-- tabella per cachare i dati meteo (evito troppe chiamate api)
CREATE TABLE IF NOT EXISTS cache_meteo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    citta VARCHAR(100) NOT NULL,
    dati TEXT NOT NULL,
    aggiornato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (citta)
);
