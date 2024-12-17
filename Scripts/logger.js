class Logger {
    static logFile = [];
    
    static log(message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            message,
            data
        };
        
        this.logFile.push(logEntry);
        console.log(`${timestamp} - ${message}`, data || '');
        
        // Salva nel localStorage per persistenza
        localStorage.setItem('timerLogs', JSON.stringify(this.logFile));
    }
    
    static error(message, error = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            type: 'ERROR',
            message,
            error: error ? error.toString() : null,
            stack: error ? error.stack : null
        };
        
        this.logFile.push(logEntry);
        console.error(`${timestamp} - ERROR - ${message}`, error || '');
        
        localStorage.setItem('timerLogs', JSON.stringify(this.logFile));
    }
    
    static getFullLog() {
        return this.logFile;
    }
    
    static clearLog() {
        this.logFile = [];
        localStorage.removeItem('timerLogs');
    }
    
    static downloadLog() {
        const logText = JSON.stringify(this.logFile, null, 2);
        const blob = new Blob([logText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `timer_log_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    static init() {
        // Carica i log precedenti dal localStorage
        const savedLogs = localStorage.getItem('timerLogs');
        if (savedLogs) {
            this.logFile = JSON.parse(savedLogs);
        }
        
        // Aggiungi pulsante per scaricare i log
        const logButton = document.createElement('button');
        logButton.textContent = 'Download Logs';
        logButton.style.position = 'fixed';
        logButton.style.bottom = '10px';
        logButton.style.right = '10px';
        logButton.style.zIndex = '9999';
        logButton.onclick = () => this.downloadLog();
        document.body.appendChild(logButton);
    }
} 