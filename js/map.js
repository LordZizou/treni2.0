// gestione della mappa leaflet

let mappa = null;
let layerPercorso = null;

// coordinate approssimative delle stazioni italiane principali
// uso un dizionario per le stazioni più comuni
const coordStazioni = {
    'MILANO CENTRALE': [45.4862, 9.2045],
    'ROMA TERMINI': [41.9002, 12.5015],
    'NAPOLI CENTRALE': [40.8531, 14.2726],
    'TORINO PORTA NUOVA': [45.0608, 7.6782],
    'BOLOGNA CENTRALE': [44.5054, 11.3427],
    'FIRENZE SMN': [43.7761, 11.2485],
    'VENEZIA SANTA LUCIA': [45.4414, 12.3219],
    'GENOVA PIAZZA PRINCIPE': [44.4175, 8.9233],
    'BARI CENTRALE': [41.1174, 16.8718],
    'PALERMO CENTRALE': [38.1115, 13.3437],
    'CATANIA CENTRALE': [37.5079, 15.0902],
    'VERONA PORTA NUOVA': [45.4299, 10.9819],
    'PADOVA': [45.4117, 11.8814],
    'TRIESTE CENTRALE': [45.6565, 13.7714],
    'BRESCIA': [45.5381, 10.2159],
    'BERGAMO': [45.6951, 9.6707],
    'COMO S. GIOVANNI': [45.8007, 9.0779],
    'VARESE': [45.8217, 8.8265],
    'MONZA': [45.5851, 9.2736],
    'TRENTO': [46.0730, 11.1190],
    'BOLZANO': [46.4983, 11.3548],
    'UDINE': [46.0710, 13.2345],
    'ANCONA': [43.6074, 13.5000],
    'PERUGIA': [43.1122, 12.3888],
    'PESCARA CENTRALE': [42.4602, 14.2149],
    'REGGIO CALABRIA CENTRALE': [38.1109, 15.6496],
    'SALERNO': [40.6782, 14.7681],
    'FOGGIA': [41.4620, 15.5446],
    'TARANTO': [40.4706, 17.2360],
    'LECCE': [40.3519, 18.1718],
    'CAGLIARI': [39.2186, 9.1072],
    'SASSARI': [40.7239, 8.5566],
    'MESSINA CENTRALE': [38.1967, 15.5530],
    'PISA CENTRALE': [43.7094, 10.3980],
    'LIVORNO CENTRALE': [43.5474, 10.3163],
    'SIENA': [43.3153, 11.3297],
    'AREZZO': [43.4628, 11.8784],
    'LA SPEZIA CENTRALE': [44.1027, 9.8228],
    'SAVONA': [44.3075, 8.4744],
    'ALESSANDRIA': [44.9127, 8.6162],
    'NOVARA': [45.4475, 8.6217],
    'CUNEO': [44.3920, 7.5492],
    'ASTI': [44.8999, 8.2028],
    'PAVIA': [45.1868, 9.1534],
    'CREMONA': [45.1330, 10.0214],
    'MANTOVA': [45.1619, 10.7946],
    'MODENA': [44.6484, 10.9253],
    'REGGIO EMILIA': [44.6971, 10.6306],
    'PARMA': [44.7981, 10.3300],
    'PIACENZA': [45.0527, 9.6962],
    'RIMINI': [44.0680, 12.5702],
    'RAVENNA': [44.4184, 12.1985],
    'FERRARA': [44.8381, 11.6198],
    'FORLÌ': [44.2208, 12.0406],
    'CESENA': [44.1394, 12.2396],
    'TREVISO': [45.6710, 12.2417],
    'VICENZA': [45.5465, 11.5478],
    'ROVIGO': [45.0695, 11.7903],
    'MESTRE': [45.4784, 12.2374],
    'VERONA': [45.4299, 10.9819],
    'GALLARATE': [45.6601, 8.7968],
    'ARONA': [45.7592, 8.5684],
    'TIRANO': [46.2156, 10.1695],
    'CHIASSO': [45.8358, 9.0289],
    'DOMODOSSOLA': [46.1139, 8.2926],
    'VERBANIA': [45.9261, 8.5544],
    'COMO': [45.8007, 9.0779],
    'SONDRIO': [46.1699, 9.8697],
};

// inizializza la mappa
function inizializzaMappa() {
    if (mappa) return;

    mappa = L.map('mappa').setView([42.5, 12.5], 6);

    // uso openstreetmap come sfondo
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(mappa);
}

// disegna il percorso del treno sulla mappa
function disegnaPercorso(fermate, posizioneTreno) {
    inizializzaMappa();

    // rimuovo layer precedente
    if (layerPercorso) {
        mappa.removeLayer(layerPercorso);
    }

    layerPercorso = L.layerGroup();

    let punti = [];
    let fermateConCoord = [];

    // per ogni fermata cerco le coordinate
    fermate.forEach((f, i) => {
        let nome = f.stazione ? f.stazione.toUpperCase() : '';
        let coord = trovaCoordiante(nome, f.lat, f.lon);

        if (coord) {
            punti.push(coord);
            fermateConCoord.push({ ...f, coord, index: i });
        }
    });

    if (punti.length === 0) {
        // se non ho coordinate mostro messaggio
        document.getElementById('mappa').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666">Coordinate non disponibili per questo percorso</div>';
        return;
    }

    // disegno la linea tratteggiata del percorso
    L.polyline(punti, {
        color: '#2563eb',
        weight: 3,
        dashArray: '8, 6',
        opacity: 0.8
    }).addTo(layerPercorso);

    // aggiungo i marker per ogni fermata
    fermateConCoord.forEach((f) => {
        let passata = f.partenza_reale || f.arrivo_reale;
        let corrente = false;

        if (posizioneTreno && posizioneTreno === f.index) {
            corrente = true;
        }

        let colore = corrente ? '#ef4444' : (passata ? '#2563eb' : '#94a3b8');
        let raggio = corrente ? 10 : 7;

        let marker = L.circleMarker(f.coord, {
            radius: raggio,
            fillColor: colore,
            color: 'white',
            weight: 2,
            fillOpacity: 1
        });

        // popup con info fermata
        let orarioPrev = formattaOrario(f.programmata_partenza || f.programmata_arrivo);
        marker.bindPopup(`<b>${f.stazione}</b><br>${orarioPrev}`);

        marker.addTo(layerPercorso);
    });

    layerPercorso.addTo(mappa);

    // zoom sul percorso
    if (punti.length > 0) {
        mappa.fitBounds(L.latLngBounds(punti), { padding: [20, 20] });
    }

    // dopo un attimo invalido la dimensione (fix per mappa in modale)
    setTimeout(() => { mappa.invalidateSize(); }, 100);
}

// cerca le coordinate di una stazione
function trovaCoordiante(nome, latApi, lonApi) {
    // prima provo le coordinate dall'api
    if (latApi && lonApi && latApi !== 0 && lonApi !== 0) {
        return [latApi, lonApi];
    }

    // altrimenti cerco nel mio dizionario
    if (coordStazioni[nome]) {
        return coordStazioni[nome];
    }

    // cerco corrispondenza parziale
    for (let chiave in coordStazioni) {
        if (nome.includes(chiave) || chiave.includes(nome)) {
            return coordStazioni[chiave];
        }
    }

    return null;
}

// formatta timestamp unix in orario leggibile
function formattaOrario(timestamp) {
    if (!timestamp) return '-';
    let d = new Date(timestamp);
    return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}
