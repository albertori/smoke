class NotificationManager {
    constructor() {
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        this.isRunning = false;
        this.pollInterval = 15000;
        this.pollTimeout = null;
    }

    async initialize() {
        try {
            // Richiedi il permesso per i badge
            if ('setAppBadge' in navigator) {
                try {
                    // Prima richiedi il permesso per le notifiche (necessario per i badge)
                    const permission = await Notification.requestPermission();
                    console.log('Permesso notifiche:', permission);
                    
                    // Test iniziale del badge
                    await navigator.setAppBadge(1);
                    await navigator.clearAppBadge();
                    console.log('Badge supportati e funzionanti');
                } catch (badgeError) {
                    console.error('Errore badge:', badgeError);
                }
            } else {
                console.log('Badge non supportati');
            }

            this.startPolling();
            return true;
        } catch (error) {
            console.error("Errore inizializzazione:", error);
            return false;
        }
    }

    startPolling() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.pollForNotifications();
    }

    async pollForNotifications() {
        try {
            const response = await fetch('notificationStream.aspx/GetNotificationCount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify({})
            });
            
            const data = await response.json();
            
            if (data.d) {
                if (data.d.error) {
                    console.error("Errore server:", data.d.error);
                } else {
                    console.log('Notifiche non lette:', data.d.count);
                    if (data.d.count > 0) {
                        if ('setAppBadge' in navigator) {
                            try {
                                await navigator.setAppBadge(data.d.count);
                                console.log('Badge impostato a:', data.d.count);
                            } catch (badgeError) {
                                console.error('Errore impostazione badge:', badgeError);
                            }
                        }
                    } else {
                        if ('clearAppBadge' in navigator) {
                            try {
                                await navigator.clearAppBadge();
                                console.log('Badge pulito');
                            } catch (badgeError) {
                                console.error('Errore pulizia badge:', badgeError);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Errore polling:", error);
        }

        if (this.isRunning) {
            this.pollTimeout = setTimeout(() => this.pollForNotifications(), this.pollInterval);
        }
    }

    stop() {
        this.isRunning = false;
        if (this.pollTimeout) {
            clearTimeout(this.pollTimeout);
            this.pollTimeout = null;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.notificationManager = new NotificationManager();
    window.notificationManager.initialize();
}); 