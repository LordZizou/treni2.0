// gestione della mappa leaflet

let mappa = null;
let layerPercorso = null;

// cache coordinate per non chiamare nominatim ogni volta
const cacheCoord = {};

// inizializza la mappa
function inizializzaMappa() {
    if (mappa) return;

    mappa = L.map('mappa').setView([42.5, 12.5], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(mappa);
}

// chiede a nominatim le coordinate di una stazione
async function geocodifica(nomeStazione) {
    // se ce l'ho già in cache non chiamo nominatim
    if (cacheCoord[nomeStazione]) return cacheCoord[nomeStazione];

    try {
        // cerco "stazione di X italy" su nominatim
        let query = encodeURIComponent(nomeStazione + ' stazione ferroviaria Italia');
        let url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=it`;

        let risposta = await fetch(url, {
            headers: { 'Accept-Language': 'it' }
        });
        let dati = await risposta.json();

        if (dati && dati.length > 0) {
            let coord = [parseFloat(dati[0].lat), parseFloat(dati[0].lon)];
            cacheCoord[nomeStazione] = coord;
            return coord;
        }
    } catch (err) {
        console.log('nominatim error per', nomeStazione, err);
    }

    return null;
}

// disegna il percorso del treno sulla mappa (async perché chiama nominatim)
async function disegnaPercorso(fermate, posizioneTreno) {
    inizializzaMappa();

    if (layerPercorso) {
        mappa.removeLayer(layerPercorso);
    }

    layerPercorso = L.layerGroup();

    // risolvo le coordinate per tutte le fermate in parallelo
    let promesse = fermate.map(async (f, i) => {
        let coord = null;

        // prima uso quelle che già arrivano dall'api trenitalia
        if (f.lat && f.lon && f.lat !== 0 && f.lon !== 0) {
            coord = [f.lat, f.lon];
        } else {
            // altrimenti chiedo a nominatim
            coord = await geocodifica(f.stazione);
        }

        return { ...f, coord, index: i };
    });

    let fermateConCoord = await Promise.all(promesse);

    // tengo solo quelle con coordinate trovate
    let valide = fermateConCoord.filter(f => f.coord !== null);

    if (valide.length === 0) {
        document.getElementById('mappa').innerHTML =
            '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666">Coordinate non disponibili</div>';
        return;
    }

    let punti = valide.map(f => f.coord);

    // disegno la linea tratteggiata
    L.polyline(punti, {
        color: '#2563eb',
        weight: 3,
        dashArray: '8, 6',
        opacity: 0.8
    }).addTo(layerPercorso);

    // aggiungo i pallini per ogni fermata
    valide.forEach((f) => {
        let passata = f.partenza_reale || f.arrivo_reale;
        let corrente = f.index === posizioneTreno;

        let colore = corrente ? '#ef4444' : (passata ? '#2563eb' : '#94a3b8');
        let raggio = corrente ? 10 : 7;

        let marker = L.circleMarker(f.coord, {
            radius: raggio,
            fillColor: colore,
            color: 'white',
            weight: 2,
            fillOpacity: 1
        });

        let orario = formattaOrario(f.programmata_partenza || f.programmata_arrivo);
        marker.bindPopup(`<b>${f.stazione}</b><br>${orario}`);
        marker.addTo(layerPercorso);
    });

    layerPercorso.addTo(mappa);
    mappa.fitBounds(L.latLngBounds(punti), { padding: [20, 20] });

    // fix dimensione mappa in modale
    setTimeout(() => { mappa.invalidateSize(); }, 100);
}

function formattaOrario(timestamp) {
    if (!timestamp) return '-';
    let d = new Date(timestamp);
    return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}
