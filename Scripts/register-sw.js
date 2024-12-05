if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registrato con successo:', registration);
            })
            .catch(error => {
                console.log('Registrazione ServiceWorker fallita:', error);
            });
    });
} 