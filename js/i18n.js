// traduzioni italiano / inglese
const traduzioni = {
    it: {
        ricercaStazione: 'Cerca stazione...',
        ricercaTreno: 'Cerca numero treno...',
        partenze: 'Partenze',
        arrivi: 'Arrivi',
        treno: 'TRENO',
        destinazione: 'DESTINAZIONE',
        provenieza: 'PROVENIENZA',
        previsto: 'PREVISTO',
        effettivo: 'EFFETTIVO',
        binario: 'BINARIO',
        stato: 'STATO',
        puntuale: 'In orario',
        inOrario: '✓ In orario',
        cancellato: 'Cancellato',
        stRecentri: 'Stazioni recenti:',
        statistiche: 'Statistiche',
        totale: 'TOTALE',
        inOrarioLabel: 'IN ORARIO',
        inRitardo: 'RITARDO',
        cancellati: 'CANCELLATI',
        meteo: 'Meteo',
        vediMappa: '🗺 Mappa',
        percorso: 'Percorso treno',
        arrivo: 'arr.',
        partenza: 'par.',
        trenoNonTrovato: 'Treno non trovato',
        selezionaStazione: 'Cerca una stazione per vedere i treni',
        caricamento: 'Caricamento...',
        nessunTreno: 'Nessun treno disponibile',
        minuti: 'min',
    },
    en: {
        ricercaStazione: 'Search station...',
        ricercaTreno: 'Search train number...',
        partenze: 'Departures',
        arrivi: 'Arrivals',
        treno: 'TRAIN',
        destinazione: 'DESTINATION',
        provenieza: 'ORIGIN',
        previsto: 'SCHEDULED',
        effettivo: 'ACTUAL',
        binario: 'PLATFORM',
        stato: 'STATUS',
        puntuale: 'On time',
        inOrario: '✓ On time',
        cancellato: 'Cancelled',
        stRecentri: 'Recent stations:',
        statistiche: 'Statistics',
        totale: 'TOTAL',
        inOrarioLabel: 'ON TIME',
        inRitardo: 'DELAYED',
        cancellati: 'CANCELLED',
        meteo: 'Weather',
        vediMappa: '🗺 Map',
        percorso: 'Train route',
        arrivo: 'arr.',
        partenza: 'dep.',
        trenoNonTrovato: 'Train not found',
        selezionaStazione: 'Search a station to see trains',
        caricamento: 'Loading...',
        nessunTreno: 'No trains available',
        minuti: 'min',
    }
};

// lingua corrente (di default italiano)
let lingua = localStorage.getItem('lingua') || 'it';

// ritorna la traduzione di una chiave
function t(chiave) {
    return traduzioni[lingua][chiave] || chiave;
}

// cambia lingua e aggiorna tutto
function cambiaLingua(nuovaLingua) {
    lingua = nuovaLingua;
    localStorage.setItem('lingua', lingua);
    applicaTraduzioni();
}

function applicaTraduzioni() {
    // aggiorno i bottoni lingua
    document.querySelectorAll('.btn-lang').forEach(b => {
        b.classList.toggle('active', b.dataset.lang === lingua);
    });

    // aggiorno i placeholder
    document.getElementById('inputStazione').placeholder = t('ricercaStazione');
    document.getElementById('inputTreno').placeholder = t('ricercaTreno');

    // aggiorno le tab
    document.getElementById('tabPartenze').textContent = t('partenze');
    document.getElementById('tabArrivi').textContent = t('arrivi');

    // aggiorno intestazione tabella
    document.getElementById('thTreno').textContent = t('treno');
    document.getElementById('thDestOrg').textContent = tabAttiva === 'partenze' ? t('destinazione') : t('provenieza');
    document.getElementById('thPrevisto').textContent = t('previsto');
    document.getElementById('thEffettivo').textContent = t('effettivo');
    document.getElementById('thBinario').textContent = t('binario');
    document.getElementById('thStato').textContent = t('stato');

    // labels statistiche
    document.querySelector('.label-totale').textContent = t('totale');
    document.querySelector('.label-orario').textContent = t('inOrarioLabel');
    document.querySelector('.label-ritardo').textContent = t('inRitardo');
    document.querySelector('.label-cancellati').textContent = t('cancellati');

    // titolo meteo e stats
    document.querySelector('.titolo-meteo').textContent = t('meteo');
    document.querySelector('.titolo-stats').textContent = t('statistiche');

    // ricarico i treni se ho una stazione selezionata
    if (stazioneSelezionata) {
        caricaTreni();
    }

    mostraRecenti();
}
