console.log('RecordManager - Inizializzazione...');

const RecordManager = {
    init() {
        console.log('RecordManager - Inizializzato');
        logger.log('RecordManager - Sistema di gestione record avviato');
    },

    KEYS: {
        BEST_TIME: 'bestTime',
        LAST_TIME: 'lastTime'
    },

    // Carica i dati dal DB
    async loadFromDB() {
        logger.log('Caricamento record dal DB...');
        try {
            const response = await serverCall('benefici.aspx/GetUserRecord', {});
            logger.log('Risposta loadFromDB:', response);
            if (response && response.d && response.d.success) {
                logger.log('Record dal DB:', response.d.bestTime);
                return response.d.bestTime;
            }
            logger.log('Nessun record trovato nel DB');
            return null;
        } catch (error) {
            logger.log('Errore caricamento dal DB:', error);
            return null;
        }
    },

    // Salva i dati nel DB
    async saveToDB(recordTime) {
        logger.log('=== INIZIO SALVATAGGIO DB ===');
        logger.log('Record da salvare:', recordTime);
        
        try {
            // Verifica che recordTime sia un numero
            const timeToSave = parseInt(recordTime);
            if (isNaN(timeToSave)) {
                logger.log('ERRORE: recordTime non è un numero valido');
                return false;
            }

            logger.log('Chiamata UpdateUserRecord con:', timeToSave);
            const response = await serverCall('benefici.aspx/UpdateUserRecord', {
                recordTime: timeToSave
            });
            
            logger.log('Risposta completa dal server:', response);
            
            if (response && response.d) {
                if (response.d.success) {
                    logger.log('Salvataggio DB completato con successo');
                    return true;
                } else {
                    logger.log('Errore dal server:', response.d.error);
                    return false;
                }
            } else {
                logger.log('Risposta server non valida');
                return false;
            }
        } catch (error) {
            logger.log('Errore durante il salvataggio:', error);
            logger.log('Stack trace:', error.stack);
            return false;
        }
    },

    // Carica i dati, prima dal DB poi dal localStorage
    async loadRecord() {
        logger.log('=== INIZIO CARICAMENTO RECORD ===');
        
        // Prima prova dal DB
        const dbRecord = await this.loadFromDB();
        logger.log('Record caricato dal DB:', dbRecord);
        
        if (dbRecord) {
            logger.log('Salvataggio record DB in localStorage');
            StorageManager.save(StorageManager.KEYS.BEST_TIMES, dbRecord);
            return dbRecord;
        }

        // Se non c'è nel DB, usa localStorage
        const localRecord = StorageManager.load(StorageManager.KEYS.BEST_TIMES);
        logger.log('Record dal localStorage:', localRecord);
        return localRecord;
    },

    // Salva il record sia in localStorage che nel DB
    async saveRecord(newTime) {
        logger.log('=== INIZIO SALVATAGGIO RECORD ===');
        logger.log('Nuovo tempo:', newTime);
        
        // Salva in localStorage
        StorageManager.save(StorageManager.KEYS.BEST_TIMES, newTime);
        logger.log('Salvato in localStorage');
        
        // Salva nel DB
        const dbResult = await this.saveToDB(newTime);
        logger.log('Risultato salvataggio DB:', dbResult);
        
        return dbResult;
    },

    // Verifica e aggiorna il record se necessario
    async checkAndUpdateRecord(currentTime) {
        logger.log('=== VERIFICA NUOVO RECORD ===');
        logger.log('Tempo corrente:', currentTime);
        
        const storedBestTime = await this.loadRecord();
        logger.log('Record precedente:', storedBestTime);
        
        if (!storedBestTime || currentTime > parseInt(storedBestTime)) {
            logger.log('Nuovo record rilevato, procedo con salvataggio');
            const saved = await this.saveRecord(currentTime);
            logger.log('Salvataggio completato:', saved);
            return true;
        }
        
        logger.log('Nessun nuovo record da salvare');
        return false;
    }
};

// Inizializza il RecordManager quando il documento è pronto
document.addEventListener('DOMContentLoaded', () => {
    RecordManager.init();
}); 