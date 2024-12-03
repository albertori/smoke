document.addEventListener('DOMContentLoaded', function() {
    // Costanti per i calcoli
    const COSTO_SIGARETTA = 0.30; // € per sigaretta
    const CATRAME_SIGARETTA = 10; // mg per sigaretta
    const TEMPO_SIGARETTA = 5; // minuti per sigaretta

    // Animazione del bottone al click
    document.getElementById('nonFumareBtn').addEventListener('click', function() {
        this.classList.add('clicked');
        setTimeout(() => this.classList.remove('clicked'), 200);
    });

    function updateDailyProgress() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        // Calcola la percentuale del giorno trascorsa
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        const percentageOfDay = (totalSeconds / (24 * 3600)) * 100;
        
        // Aggiorna la larghezza della barra
        const progressBar = document.getElementById('dailyProgressBar');
        progressBar.style.width = percentageOfDay + '%';
    }

    // Aggiorna ogni secondo
    setInterval(updateDailyProgress, 1000);
    // Esegui subito la prima volta
    updateDailyProgress();
}); 