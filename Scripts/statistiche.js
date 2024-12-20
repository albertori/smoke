// Funzione per formattare il tempo in HH:MM:SS
function formatTime(seconds) {
    if (!seconds) return "00:00:00";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return [hours, minutes, remainingSeconds]
        .map(v => v < 10 ? "0" + v : v)
        .join(":");
}

// Funzione per aggiornare i tempi di resistenza
function updateTempiResistenza(data) {
    if (data && data.d) {
        const result = data.d;
        
        if (result.success) {
            // Aggiorna i tempi
            document.getElementById('tempoTotale').innerText = formatTime(result.tempoTotale);
            document.getElementById('tempoMedio').innerText = formatTime(result.tempoMedio);
            document.getElementById('tempoMinimo').innerText = formatTime(result.tempoMinimo);
            document.getElementById('tempoMassimo').innerText = formatTime(result.tempoMassimo);
            
            // Aggiorna ora e giorno critici
            document.getElementById('oraCritica').innerText = result.oraCritica;
            document.getElementById('giornoCritico').innerText = result.giornoCritico;
            
            // Aggiorna le statistiche settimanali
            document.getElementById('tentativiSettimanaCorrente').innerText = result.settimanaCorrente;
            document.getElementById('tentativiSettimanaScorsa').innerText = result.settimanaScorsa;
            
            // Aggiorna la variazione percentuale
            const variazioneEl = document.getElementById('variazioneSettimanale');
            if (variazioneEl) {
                const variazione = result.variazionePercentuale;
                const segno = variazione >= 0 ? '+' : '';
                variazioneEl.innerText = segno + variazione.toFixed(1) + '%';
                variazioneEl.className = variazione <= 0 ? 'positive-change' : 'negative-change';
            }
        }
    }
}

// Funzione per recuperare i dati
function getTempiResistenza() {
    fetch('statistiche.aspx/GetTempiResistenza', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        updateTempiResistenza(data);
    })
    .catch(error => {
        console.error('Errore nel recupero dei tempi di resistenza:', error);
    });
}

// Inizializza quando il documento è pronto
document.addEventListener('DOMContentLoaded', function() {
    getTempiResistenza();
}); 