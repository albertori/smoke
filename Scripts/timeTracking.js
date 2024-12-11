document.addEventListener('DOMContentLoaded', function() {
    let startTime = Date.now();
    let bestTime = localStorage.getItem('bestTime') 
        ? parseInt(localStorage.getItem('bestTime')) 
        : 0;
    let timeInterval;
    const MAX_TIME = 3600; // 1 ora in secondi
    const TIME_MULTIPLIER = 10; // Accelera il tempo di 10 volte per i test

    // Elementi DOM
    const currentTimeBar = document.getElementById('currentTimeBar');
    const lastTimeBar = document.getElementById('lastTimeBar');
    const currentTimeLabel = document.getElementById('currentTimeLabel');
    const lastTimeLabel = document.getElementById('lastTimeLabel');

    function updateCurrentTime() {
        const now = Date.now();
        const elapsed = Math.floor(((now - startTime) * TIME_MULTIPLIER) / 1000);
        
        // Se è passata un'ora, resetta il timer
        if (elapsed >= MAX_TIME) {
            startTime = now;
            currentTimeBar.style.width = '0%';
            currentTimeLabel.textContent = '00:00:00';
            return;
        }

        // Aggiorna la barra inferiore con il tempo corrente
        const width = Math.min((elapsed / MAX_TIME) * 100, 100);
        currentTimeBar.style.width = width + '%';
        currentTimeLabel.textContent = formatTime(elapsed);

        // Calcola il colore in base al progresso verso il record
        if (bestTime > 0) {
            const ratio = elapsed / (bestTime/1000);
            if (ratio <= 0.5) {
                // Da rosso a arancione
                currentTimeBar.style.backgroundColor = 'var(--danger-color)';
            } else if (ratio <= 0.8) {
                // Da arancione a giallo
                currentTimeBar.style.backgroundColor = 'var(--primary-color)';
            } else if (ratio < 1) {
                // Da giallo a verde chiaro
                currentTimeBar.style.backgroundColor = '#2ecc71';
            } else {
                // Verde pieno quando supera il record
                currentTimeBar.style.backgroundColor = 'var(--secondary-color)';
            }

            // Mostra quanto manca al record
            const remaining = Math.floor(bestTime/1000) - elapsed;
            if (remaining > 0) {
                document.getElementById('remainingTimeOverlay').textContent = 
                    `-${formatTime(remaining)} al record`;
            } else {
                document.getElementById('remainingTimeOverlay').textContent = 
                    `+${formatTime(Math.abs(remaining))} oltre il record`;
            }
        }
    }

    function resetTimer() {
        const now = Date.now();
        const elapsedTime = Math.floor(((now - startTime) * TIME_MULTIPLIER) / 1000);
        
        // Controlla se il tempo trascorso è maggiore del record attuale
        if (elapsedTime * 1000 > bestTime) {
            // Aggiorna il record
            bestTime = elapsedTime * 1000;
            localStorage.setItem('bestTime', bestTime.toString());
            
            // Aggiorna la barra superiore
            const width = Math.min((elapsedTime / MAX_TIME) * 100, 100);
            lastTimeBar.style.width = width + '%';
            lastTimeLabel.textContent = formatTime(elapsedTime);
            
            // Effetto visivo
            currentTimeBar.classList.add('celebrate');
            setTimeout(() => currentTimeBar.classList.remove('celebrate'), 3000);
        }

        // Resetta il timer corrente
        startTime = now;
        currentTimeBar.style.width = '0%';
        currentTimeLabel.textContent = '00:00:00';
    }

    function resetBestTime() {
        bestTime = 0;
        localStorage.removeItem('bestTime');
        lastTimeBar.style.width = '0%';
        lastTimeLabel.textContent = '00:00:00';
        document.getElementById('remainingTimeOverlay').textContent = '';
    }

    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
    }

    function padZero(num) {
        return num.toString().padStart(2, '0');
    }

    // Inizializza la barra superiore con il record salvato
    if (bestTime > 0) {
        const width = Math.min((bestTime / (MAX_TIME * 1000)) * 100, 100);
        lastTimeBar.style.width = width + '%';
        lastTimeLabel.textContent = formatTime(Math.floor(bestTime/1000));
    }

    // Avvia il timer e aggiungi gli event listener
    timeInterval = setInterval(updateCurrentTime, 1000);
    document.getElementById('clickButton').addEventListener('click', resetTimer);
    document.getElementById('resetBestTime').addEventListener('click', resetBestTime);
}); 