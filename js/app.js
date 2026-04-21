// variabili globali
let stazioneSelezionata = null;
let tabAttiva = 'partenze';
let trenoSelezionato = null;
let timerAggiornamento = null;
let timerStats = null;

// avvio tutto quando la pagina è pronta
document.addEventListener('DOMContentLoaded', () => {
    applicaTraduzioni();
    mostraRecenti();
    caricaStatistiche();
    applicaTema();

    // aggiorno le statistiche ogni 30 secondi
    timerStats = setInterval(caricaStatistiche, 30000);

    // setup eventi
    document.getElementById('inputStazione').addEventListener('input', onInputStazione);
    document.getElementById('inputTreno').addEventListener('input', onInputTreno);

    // chiudo autocomplete cliccando fuori
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            chiudiAutocomplete();
        }
    });
});

// ---- TEMA ----

function applicaTema() {
    let tema = localStorage.getItem('tema') || 'light';
    document.documentElement.setAttribute('data-theme', tema);
    let track = document.getElementById('switchTrack');
    if (tema === 'dark') track.classList.add('on');
    else track.classList.remove('on');
}

function toggleTema() {
    let attuale = document.documentElement.getAttribute('data-theme');
    let nuovo = attuale === 'dark' ? 'light' : 'dark';
    localStorage.setItem('tema', nuovo);
    applicaTema();
}

// ---- AUTOCOMPLETE STAZIONI ----

let timerDigitazione = null;

function onInputStazione(e) {
    let val = e.target.value.trim();
    clearTimeout(timerDigitazione);

    if (val.length < 2) {
        chiudiAutocomplete('stazione');
        return;
    }

    // aspetto 300ms prima di chiamare (debounce)
    timerDigitazione = setTimeout(() => {
        cercaStazioni(val);
    }, 300);
}

async function cercaStazioni(testo) {
    let lista = document.getElementById('listaStazioni');
    lista.innerHTML = '<div style="padding:12px;color:var(--text2)">...</div>';
    lista.classList.add('show');

    try {
        // chiamo il mio backend php
        let risposta = await fetch(`api/stazioni.php?q=${encodeURIComponent(testo)}`);
        let dati = await risposta.json();

        lista.innerHTML = '';

        if (!dati || dati.length === 0) {
            lista.innerHTML = '<div style="padding:12px;color:var(--text2)">Nessuna stazione trovata</div>';
            return;
        }

        dati.forEach(stazione => {
            let item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.innerHTML = `
                <span style="font-size:1.1rem">🚉</span>
                <div>
                    <div class="nome">${stazione.nomeLungo || stazione.nomeBreve}</div>
                    <div class="codice">${stazione.id}</div>
                </div>`;
            item.addEventListener('click', () => {
                selezionaStazione(stazione);
            });
            lista.appendChild(item);
        });

    } catch (err) {
        console.error('errore cerca stazioni:', err);
        lista.innerHTML = '<div style="padding:12px;color:var(--text2)">Errore di rete</div>';
    }
}

function selezionaStazione(stazione) {
    stazioneSelezionata = stazione;
    document.getElementById('inputStazione').value = stazione.nomeLungo || stazione.nomeBreve;
    chiudiAutocomplete('stazione');

    // salvo nelle recenti
    salvaRecente(stazione);
    mostraRecenti();

    // carico i treni
    caricaTreni();

    // carico meteo
    let nomeCitta = (stazione.nomeLungo || stazione.nomeBreve).split(' ')[0];
    caricaMeteo(nomeCitta);
}

// ---- AUTOCOMPLETE NUMERO TRENO ----

let timerTreno = null;

function onInputTreno(e) {
    let val = e.target.value.trim();
    clearTimeout(timerTreno);

    if (val.length < 1) {
        chiudiAutocomplete('treno');
        return;
    }

    timerTreno = setTimeout(() => {
        cercaTreno(val);
    }, 400);
}

async function cercaTreno(numero) {
    let lista = document.getElementById('listaTreni');
    lista.innerHTML = '<div style="padding:12px;color:var(--text2)">...</div>';
    lista.classList.add('show');

    try {
        let risposta = await fetch(`api/cerca_treno.php?q=${encodeURIComponent(numero)}`);
        let dati = await risposta.json();

        lista.innerHTML = '';

        if (!dati || dati.length === 0) {
            lista.innerHTML = '<div style="padding:12px;color:var(--text2)">Nessun treno trovato</div>';
            return;
        }

        dati.forEach(tr => {
            let item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.innerHTML = `
                <span style="font-size:1.1rem">🚆</span>
                <div>
                    <div class="nome">Treno ${tr.numero}</div>
                    <div class="codice">da ${tr.origine_nome}</div>
                </div>`;
            item.addEventListener('click', () => {
                document.getElementById('inputTreno').value = tr.numero;
                chiudiAutocomplete('treno');
                apriDettaglioTreno(tr.numero, tr.origine_codice);
            });
            lista.appendChild(item);
        });

    } catch (err) {
        console.error('errore cerca treno:', err);
    }
}

function chiudiAutocomplete(quale) {
    if (!quale || quale === 'stazione') document.getElementById('listaStazioni').classList.remove('show');
    if (!quale || quale === 'treno') document.getElementById('listaTreni').classList.remove('show');
}

// ---- STAZIONI RECENTI ----

function salvaRecente(stazione) {
    let recenti = JSON.parse(localStorage.getItem('recenti') || '[]');

    // tolgo duplicati
    recenti = recenti.filter(r => r.id !== stazione.id);
    recenti.unshift(stazione);

    // tengo solo le ultime 6
    if (recenti.length > 6) recenti = recenti.slice(0, 6);

    localStorage.setItem('recenti', JSON.stringify(recenti));
}

function mostraRecenti() {
    let recenti = JSON.parse(localStorage.getItem('recenti') || '[]');
    let container = document.getElementById('stazioni-recenti');

    if (recenti.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    let html = `<span class="recenti-label">${t('stRecentri')}</span>`;
    recenti.forEach(st => {
        html += `<span class="chip" onclick="selezionaStazione(${JSON.stringify(st).replace(/"/g, '&quot;')})">${st.nomeLungo || st.nomeBreve}</span>`;
    });
    container.innerHTML = html;
}

// ---- PARTENZE / ARRIVI ----

function cambiTab(quale) {
    tabAttiva = quale;

    document.getElementById('tabPartenze').classList.toggle('active', quale === 'partenze');
    document.getElementById('tabArrivi').classList.toggle('active', quale === 'arrivi');

    // aggiorno intestazione colonna destinazione/provenienza
    document.getElementById('thDestOrg').textContent = quale === 'partenze' ? t('destinazione') : t('provenieza');

    if (stazioneSelezionata) caricaTreni();
}

async function caricaTreni() {
    let tbody = document.getElementById('tbody-treni');
    tbody.innerHTML = `<tr><td colspan="6"><div class="spinner"><div class="spinner-ring"></div></div></td></tr>`;

    if (!stazioneSelezionata) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">🚉</div><div class="empty-text">${t('selezionaStazione')}</div></div></td></tr>`;
        return;
    }

    let codice = stazioneSelezionata.id;
    let endpoint = tabAttiva === 'partenze' ? 'api/partenze.php' : 'api/arrivi.php';

    try {
        let risposta = await fetch(`${endpoint}?codice=${encodeURIComponent(codice)}`);
        let dati = await risposta.json();

        if (!dati || dati.error || dati.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">🚉</div><div class="empty-text">${t('nessunTreno')}</div></div></td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        dati.forEach(treno => {
            tbody.appendChild(creaRigaTreno(treno));
        });

    } catch (err) {
        console.error('errore carica treni:', err);
        tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-text">Errore di rete</div></div></td></tr>`;
    }
}

function creaRigaTreno(treno) {
    let tr = document.createElement('tr');

    // tipo treno (REG, FR, ecc)
    let tipo = treno.categoriaDescrizione || treno.categoria || '';
    let numero = treno.numeroTreno || '';
    let dest = tabAttiva === 'partenze'
        ? (treno.destinazione || '-')
        : (treno.origine || '-');

    // orario previsto
    let previsto = '-';
    if (tabAttiva === 'partenze' && treno.orarioPartenza) {
        previsto = formattaTimestamp(treno.orarioPartenza);
    } else if (tabAttiva === 'arrivi' && treno.orarioArrivo) {
        previsto = formattaTimestamp(treno.orarioArrivo);
    }

    // orario effettivo
    let effettivo = '-';
    if (treno.compOrarioPartenzaZero || treno.compOrarioArrivoZero) {
        effettivo = treno.compOrarioPartenzaZero || treno.compOrarioArrivoZero;
    }

    // ritardo e stato
    let ritardo = treno.ritardo || 0;
    let cancellato = treno.provvedimento === 1 || treno.binarioEffettivoArrivoDescrizione === 'CANCELLATO';

    let statoHtml;
    if (cancellato) {
        statoHtml = `<span class="stato stato-cancellato">✕ ${t('cancellato')}</span>`;
    } else if (ritardo > 0) {
        statoHtml = `<span class="stato stato-ritardo">⏱ +${ritardo} ${t('minuti')}</span>`;
    } else {
        statoHtml = `<span class="stato stato-ok">${t('inOrario')}</span>`;
    }

    // binario
    let binario = treno.binarioEffettivoPartenzaDescrizione
        || treno.binarioEffettivoArrivoDescrizione
        || treno.binarioProgrammatoPartenzaDescrizione
        || treno.binarioProgrammatoArrivoDescrizione
        || '-';

    // badge tipo treno
    let tipoClasse = 'tipo-' + tipo.replace(/\s/g, '');
    let badgeHtml = tipo ? `<span class="badge-tipo ${tipoClasse}">${tipo}</span>` : '';

    tr.innerHTML = `
        <td>${badgeHtml}<span class="treno-numero">${numero}</span></td>
        <td>${dest}</td>
        <td>${previsto}</td>
        <td class="col-effettivo">${effettivo}</td>
        <td class="col-piattaforma">${binario}</td>
        <td>${statoHtml}</td>`;

    // cliccando sulla riga apro il dettaglio
    tr.addEventListener('click', () => {
        let origCodice = treno.codOrigine || (stazioneSelezionata ? stazioneSelezionata.id : '');
        apriDettaglioTreno(numero, origCodice);
    });

    return tr;
}

function formattaTimestamp(ts) {
    if (!ts) return '-';
    let d = new Date(ts);
    return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

// ---- DETTAGLIO TRENO (MODALE) ----

async function apriDettaglioTreno(numero, origine) {
    let modale = document.getElementById('modale');
    modale.classList.add('show');
    document.getElementById('titolo-modale').textContent = `${t('percorso')} ${numero}`;
    document.getElementById('fermate-list').innerHTML = `<div class="spinner"><div class="spinner-ring"></div></div>`;
    document.getElementById('mappa').innerHTML = '';

    try {
        let url = `api/treno.php?numero=${encodeURIComponent(numero)}`;
        if (origine) url += `&origine=${encodeURIComponent(origine)}`;

        let risposta = await fetch(url);
        let dati = await risposta.json();

        if (!dati || dati.error) {
            document.getElementById('fermate-list').innerHTML = `<div class="empty-state"><div class="empty-text">${t('trenoNonTrovato')}</div></div>`;
            return;
        }

        let fermate = dati.fermate || [];
        mostraFermate(fermate, dati.fermataCorrente);

        // disegno la mappa con le fermate
        disegnaPercorso(fermate, dati.fermataCorrente);

    } catch (err) {
        console.error('errore dettaglio treno:', err);
        document.getElementById('fermate-list').innerHTML = `<div class="empty-state"><div class="empty-text">Errore di rete</div></div>`;
    }
}

function mostraFermate(fermate, fermataCorrente) {
    let lista = document.getElementById('fermate-list');
    lista.innerHTML = '';

    if (!fermate || fermate.length === 0) {
        lista.innerHTML = '<div class="empty-state"><div class="empty-text">Nessuna fermata disponibile</div></div>';
        return;
    }

    fermate.forEach((f, i) => {
        let li = document.createElement('li');
        li.className = 'fermata-item';

        let passata = f.partenza_reale || f.arrivo_reale;
        let corrente = i === fermataCorrente;

        let dotClass = corrente ? 'corrente' : (passata ? 'passata' : '');

        let orPartenza = f.programmata_partenza ? formattaTimestamp(f.programmata_partenza) : null;
        let orArrivo = f.programmata_arrivo ? formattaTimestamp(f.programmata_arrivo) : null;
        let orarioStr = '';

        if (orArrivo && orPartenza) {
            orarioStr = `${t('arrivo')} ${orArrivo} — ${t('partenza')} ${orPartenza}`;
        } else if (orPartenza) {
            orarioStr = `${t('partenza')} ${orPartenza}`;
        } else if (orArrivo) {
            orarioStr = `${t('arrivo')} ${orArrivo}`;
        }

        let ritardoHtml = '';
        let ritardo = f.ritardo || f.ritardoPartenza || f.ritardoArrivo;
        if (ritardo && ritardo > 0) {
            ritardoHtml = `<span class="ritardo-badge">+${ritardo} ${t('minuti')}</span>`;
        }

        li.innerHTML = `
            <div class="fermata-dot ${dotClass}"></div>
            <div style="flex:1">
                <div class="fermata-nome">${f.stazione}</div>
                <div class="fermata-orari">${orarioStr}</div>
            </div>
            ${ritardoHtml}`;

        lista.appendChild(li);
    });
}

function chiudiModale() {
    document.getElementById('modale').classList.remove('show');
}

// chiudo modale cliccando fuori
document.getElementById('modale').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modale')) chiudiModale();
});

// ---- STATISTICHE ----

async function caricaStatistiche() {
    try {
        let risposta = await fetch('api/statistiche.php');
        let dati = await risposta.json();

        if (dati.error) return;

        // aggiorno i numeri
        document.getElementById('stat-totale').textContent = dati.totaleTreni || 0;
        document.getElementById('stat-orario').textContent = dati.treniRegolari || 0;
        document.getElementById('stat-ritardo').textContent = dati.treniRitardo || 0;
        document.getElementById('stat-cancellati').textContent = dati.treniSoppress || 0;

        // aggiorno il counter nella navbar
        document.getElementById('treni-live-count').textContent = dati.totaleTreni || 0;

    } catch (err) {
        console.error('errore statistiche:', err);
    }
}

// ---- METEO ----

async function caricaMeteo(citta) {
    let container = document.getElementById('meteo-content');
    container.innerHTML = '<div style="padding:16px;color:var(--text2)">Caricamento meteo...</div>';

    try {
        let risposta = await fetch(`api/meteo.php?citta=${encodeURIComponent(citta)}`);
        let dati = await risposta.json();

        if (dati.error) {
            container.innerHTML = '<div style="padding:16px;color:var(--text2)">Meteo non disponibile</div>';
            return;
        }

        // mostro i dati meteo
        container.innerHTML = `
            <div class="meteo-box">
                <img class="meteo-img" src="https://openweathermap.org/img/wn/${dati.icona}@2x.png" alt="${dati.descrizione}">
                <div>
                    <div class="meteo-temp">${dati.temp}°C</div>
                    <div class="meteo-desc">${dati.descrizione}</div>
                    <div class="meteo-minmax">
                        <span>🌅 ${dati.min}°</span>
                        <span>🌇 ${dati.max}°</span>
                    </div>
                </div>
            </div>`;

    } catch (err) {
        container.innerHTML = '<div style="padding:16px;color:var(--text2)">Meteo non disponibile</div>';
    }
}

// aggiorno manualmente i treni
function aggiornaTreni() {
    if (stazioneSelezionata) caricaTreni();
}
