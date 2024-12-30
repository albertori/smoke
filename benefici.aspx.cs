using System;
using System.Web.Services;
using System.Web.Script.Services;
using System.Configuration;
using System.Data.OleDb;
using System.Web.UI;
using System.Linq;

namespace NomeProgetto
{
    public partial class benefici : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            // Verifica se l'utente è autenticato
            if (!IsPostBack)
            {
                if (Session["Email"] != null)
                {
                    userEmail.InnerText = Session["Email"].ToString();
                    // Aggiungiamo il caricamento del record
                    LoadUserRecord();
                }
                else if (Request.Cookies["UserAuth"] != null)
                {
                    // Se non c'è la sessione ma c'è il cookie
                    string[] authData = Request.Cookies["UserAuth"].Value.Split('|');
                    if (authData.Length == 2)
                    {
                        Session["UtenteID"] = authData[0];
                        Session["Email"] = authData[1];
                        userEmail.InnerText = authData[1];
                        // Aggiungiamo il caricamento del record
                        LoadUserRecord();
                    }
                    else
                    {
                        Response.Redirect("login.aspx", false);
                        Context.ApplicationInstance.CompleteRequest();
                        return;
                    }
                }
                else
                {
                    // Solo se non c'è né sessione né cookie facciamo il redirect
                    Response.Redirect("login.aspx", false);
                    Context.ApplicationInstance.CompleteRequest();
                    return;
                }

                // Imposta l'ID utente per le notifiche
                if (Session["UtenteID"] != null)
                {
                    hdnUserId.Value = Session["UtenteID"].ToString();
                    
                    // Aggiungiamo qui il controllo per StatoTimer
                    CheckUserTimerRecord(Convert.ToInt32(Session["UtenteID"]));
                }
            }
        }

        // Nuovo metodo per gestire StatoTimer
        private void CheckUserTimerRecord(int userId)
        {
            try
            {
                string connString = ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString;
                using (OleDbConnection conn = new OleDbConnection(connString))
                {
                    conn.Open();
                    string query = "SELECT COUNT(*) FROM StatoTimer WHERE UtenteID = ?";
                    using (OleDbCommand cmd = new OleDbCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId);
                        int count = Convert.ToInt32(cmd.ExecuteScalar());

                        if (count == 0)
                        {
                            // Se non esiste un record, ne creiamo uno nuovo
                            string insertQuery = @"INSERT INTO StatoTimer 
                                         (UtenteID, CurrentTime, RecordTime, StartTime, LastUpdate, Modalita) 
                                         VALUES (?, 0, 0, Now(), Now(), False)";
                            
                            using (OleDbCommand insertCmd = new OleDbCommand(insertQuery, conn))
                            {
                                insertCmd.Parameters.AddWithValue("?", userId);
                                insertCmd.ExecuteNonQuery();
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                LogError("Errore in CheckUserTimerRecord: " + ex.Message);
            }
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public static object GetDatiIniziali(bool modalitaFumato)
        {
            try
            {
                var context = System.Web.HttpContext.Current;
                int? userId = null;
                
                if (context.Session["UtenteID"] != null)
                {
                    userId = Convert.ToInt32(context.Session["UtenteID"]);
                }

                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();
                    
                    int sigarette = 0;
                    double risparmio = 0;
                    int catrame = 0;
                    int tempo = 0;
                    
                    string query = @"SELECT TOP 1 Sigarette, Risparmio, Catrame, Tempo 
                                   FROM Progressi 
                                   WHERE UtenteID = ? AND Modalita = ? 
                                   ORDER BY ID DESC";

                    using (OleDbCommand cmdRead = new OleDbCommand(query, conn))
                    {
                        cmdRead.Parameters.AddWithValue("?", userId);
                        cmdRead.Parameters.AddWithValue("?", modalitaFumato);

                        using (OleDbDataReader reader = cmdRead.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                sigarette = Convert.ToInt32(reader["Sigarette"]);
                                risparmio = Convert.ToDouble(reader["Risparmio"]);
                                catrame = Convert.ToInt32(reader["Catrame"]);
                                tempo = Convert.ToInt32(reader["Tempo"]);
                            }
                        }
                    }

                    return new {
                        sigarette = sigarette,
                        risparmio = risparmio,
                        catrame = catrame,
                        tempo = tempo,
                        userId = userId,
                        modalita = modalitaFumato
                    };
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Errore in GetDatiIniziali: " + ex.Message);
                throw new Exception("Errore nel recupero dei dati");
            }
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public static object IncrementaContatore(bool modalitaFumato)
        {
            try
            {
                var context = System.Web.HttpContext.Current;
                int? userId = null;
                
                if (context.Session["UtenteID"] != null)
                {
                    userId = Convert.ToInt32(context.Session["UtenteID"]);
                }

                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();
                    
                    int sigarette = 0;
                    double risparmio = 0;
                    int catrame = 0;
                    int tempo = 0;
                    
                    // Leggi i valori attuali per la modalità specificata
                    string queryRead = @"SELECT TOP 1 Sigarette, Risparmio, Catrame, Tempo 
                                       FROM Progressi 
                                       WHERE UtenteID = ? AND Modalita = ? 
                                       ORDER BY ID DESC";

                    using (OleDbCommand cmdRead = new OleDbCommand(queryRead, conn))
                    {
                        cmdRead.Parameters.AddWithValue("?", userId);
                        cmdRead.Parameters.AddWithValue("?", modalitaFumato);

                        using (OleDbDataReader reader = cmdRead.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                sigarette = Convert.ToInt32(reader["Sigarette"]);
                                risparmio = Convert.ToDouble(reader["Risparmio"]);
                                catrame = Convert.ToInt32(reader["Catrame"]);
                                tempo = Convert.ToInt32(reader["Tempo"]);
                            }
                        }
                    }

                    // Incrementa i valori
                    sigarette++;
                    risparmio += 0.30;
                    catrame += 10;
                    tempo += 5;

                    // Inserisci nuova riga con la modalità
                    string queryInsert = @"INSERT INTO Progressi 
                                         (DataOra, Sigarette, Risparmio, Catrame, Tempo, UtenteID, Modalita) 
                                         VALUES (Now(), ?, ?, ?, ?, ?, ?)";

                    using (OleDbCommand cmdInsert = new OleDbCommand(queryInsert, conn))
                    {
                        cmdInsert.Parameters.AddWithValue("?", sigarette);
                        cmdInsert.Parameters.AddWithValue("?", risparmio);
                        cmdInsert.Parameters.AddWithValue("?", catrame);
                        cmdInsert.Parameters.AddWithValue("?", tempo);
                        cmdInsert.Parameters.AddWithValue("?", userId);
                        cmdInsert.Parameters.AddWithValue("?", modalitaFumato);
                        cmdInsert.ExecuteNonQuery();
                    }

                    return new {
                        sigarette = sigarette,
                        risparmio = risparmio,
                        catrame = catrame,
                        tempo = tempo,
                        userId = userId,
                        modalita = modalitaFumato
                    };
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Errore in IncrementaContatore: " + ex.Message);
                throw new Exception("Errore nell'incremento del contatore");
            }
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public static object VerificaAutenticazione(string email)
        {
            try
            {
                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();
                    using (OleDbCommand cmd = new OleDbCommand("SELECT ID FROM Utenti WHERE Email = ?", conn))
                    {
                        cmd.Parameters.AddWithValue("@Email", email);
                        object result = cmd.ExecuteScalar();
                        if (result != null)
                        {
                            int userId = Convert.ToInt32(result);
                            return new { success = true, userId = userId };
                        }
                    }
                }
                return new { success = false };
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Errore in VerificaAutenticazione: " + ex.Message);
                throw;
            }
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public static object SalvaIntervallo(string dataOraInizio, string dataOraFine, int durataSec)
        {
            var context = System.Web.HttpContext.Current;
            try
            {
                System.Diagnostics.Debug.WriteLine("=== INIZIO SALVA INTERVALLO ===");
                System.Diagnostics.Debug.WriteLine("Data Inizio: " + dataOraInizio);
                System.Diagnostics.Debug.WriteLine("Data Fine: " + dataOraFine);
                System.Diagnostics.Debug.WriteLine("Durata: " + durataSec);
                
                int? userId = null;
                
                if (context.Session["UtenteID"] != null)
                {
                    userId = Convert.ToInt32(context.Session["UtenteID"]);
                    System.Diagnostics.Debug.WriteLine("UserID trovato: " + userId);
                }

                if (!userId.HasValue)
                {
                    throw new Exception("Utente non autenticato");
                }

                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    System.Diagnostics.Debug.WriteLine("Tentativo di connessione al database...");
                    conn.Open();
                    System.Diagnostics.Debug.WriteLine("Connessione al database stabilita");
                    
                    // Prima salva in TempiIntervalli
                    string queryTempiIntervalli = @"INSERT INTO TempiIntervalli 
                                                  (UtenteID, DataOraInizio, DataOraFine, DurataSec) 
                                                  VALUES (?, ?, ?, ?)";
                    
                    System.Diagnostics.Debug.WriteLine("Esecuzione query TempiIntervalli...");
                    using (OleDbCommand cmdTempi = new OleDbCommand(queryTempiIntervalli, conn))
                    {
                        cmdTempi.Parameters.AddWithValue("UtenteID", userId.Value);
                        cmdTempi.Parameters.AddWithValue("DataOraInizio", DateTime.Parse(dataOraInizio));
                        cmdTempi.Parameters.AddWithValue("DataOraFine", DateTime.Parse(dataOraFine));
                        cmdTempi.Parameters.AddWithValue("DurataSec", durataSec);
                        
                        int rowsAffectedTempi = cmdTempi.ExecuteNonQuery();
                        System.Diagnostics.Debug.WriteLine("Righe inserite in TempiIntervalli: " + rowsAffectedTempi);
                    }

                    // Poi aggiorna StatoTimer
                    System.Diagnostics.Debug.WriteLine("Aggiornamento StatoTimer...");
                    string queryUpdate = @"UPDATE StatoTimer 
                                         SET CurrentTime = ?, 
                                             RecordTime = ?, 
                                             StartTime = ?, 
                                             LastUpdate = ? 
                                         WHERE UtenteID = ?";
                    
                    using (OleDbCommand cmdUpdate = new OleDbCommand(queryUpdate, conn))
                    {
                        cmdUpdate.Parameters.AddWithValue("CurrentTime", durataSec);
                        cmdUpdate.Parameters.AddWithValue("RecordTime", durataSec);
                        cmdUpdate.Parameters.AddWithValue("StartTime", DateTime.Parse(dataOraInizio));
                        cmdUpdate.Parameters.AddWithValue("LastUpdate", DateTime.Parse(dataOraFine));
                        cmdUpdate.Parameters.AddWithValue("UtenteID", userId.Value);
                        
                        int rowsAffectedUpdate = cmdUpdate.ExecuteNonQuery();
                        System.Diagnostics.Debug.WriteLine("Righe aggiornate in StatoTimer: " + rowsAffectedUpdate);

                        // Se non esiste record, lo creiamo
                        if (rowsAffectedUpdate == 0)
                        {
                            System.Diagnostics.Debug.WriteLine("Nessuna riga aggiornata, tentativo di inserimento...");
                            string queryInsert = @"INSERT INTO StatoTimer 
                                             (UtenteID, CurrentTime, RecordTime, StartTime, LastUpdate) 
                                             VALUES (?, ?, ?, ?, ?)";
                            
                            using (OleDbCommand cmdInsert = new OleDbCommand(queryInsert, conn))
                            {
                                cmdInsert.Parameters.AddWithValue("UtenteID", userId.Value);
                                cmdInsert.Parameters.AddWithValue("CurrentTime", durataSec);
                                cmdInsert.Parameters.AddWithValue("RecordTime", durataSec);
                                cmdInsert.Parameters.AddWithValue("StartTime", DateTime.Parse(dataOraInizio));
                                cmdInsert.Parameters.AddWithValue("LastUpdate", DateTime.Parse(dataOraFine));
                                
                                int rowsAffectedInsert = cmdInsert.ExecuteNonQuery();
                                System.Diagnostics.Debug.WriteLine("Righe inserite in StatoTimer: " + rowsAffectedInsert);
                            }
                        }
                    }

                    System.Diagnostics.Debug.WriteLine("=== FINE SALVA INTERVALLO ===");
                    return new { success = true, message = "Intervallo salvato con successo" };
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("=== ERRORE IN SALVA INTERVALLO ===");
                System.Diagnostics.Debug.WriteLine("Messaggio: " + ex.Message);
                System.Diagnostics.Debug.WriteLine("Stack trace: " + ex.StackTrace);
                return new { success = false, error = ex.Message };
            }
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public static object GetUserRecord()
        {
            LogError("=== INIZIO GetUserRecord ===");
            
            try
            {
                var context = System.Web.HttpContext.Current;
                int? userId = null;
                
                if (context.Session["UtenteID"] != null)
                {
                    userId = Convert.ToInt32(context.Session["UtenteID"]);
                    LogError("UserID trovato: " + userId);
                }

                if (!userId.HasValue)
                {
                    LogError("ERRORE: Utente non autenticato");
                    throw new Exception("Utente non autenticato");
                }

                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();
                    LogError("Connessione DB aperta");
                    
                    string query = "SELECT RecordTime FROM StatoTimer WHERE UtenteID = ?";
                    
                    using (OleDbCommand cmd = new OleDbCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId.Value);
                        object result = cmd.ExecuteScalar();
                        
                        if (result != null && result != DBNull.Value)
                        {
                            int bestTime = Convert.ToInt32(result);
                            LogError("Record trovato: " + bestTime);
                            return new { success = true, bestTime = bestTime };
                        }
                        
                        LogError("Nessun record trovato");
                        return new { success = true, bestTime = 0 };
                    }
                }
            }
            catch (Exception ex)
            {
                LogError("ERRORE in GetUserRecord: " + ex.Message);
                LogError("Stack trace: " + ex.StackTrace);
                return new { success = false, error = ex.Message };
            }
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public static object SalvaStatoTimer(int currentTime, int recordTime, string startTime, bool isLogout, bool modalita)
        {
            try
            {
                var context = System.Web.HttpContext.Current;
                int? userId = null;
                
                if (context.Session["UtenteID"] != null)
                {
                    userId = Convert.ToInt32(context.Session["UtenteID"]);
                }

                if (!userId.HasValue)
                {
                    throw new Exception("Utente non autenticato");
                }

                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();
                    
                    if (isLogout)
                    {
                        // Salva in TempiIntervalli con la modalità
                        string queryTempiIntervalli = @"INSERT INTO TempiIntervalli 
                                                      (UtenteID, DataOraInizio, DataOraFine, DurataSec, Modalita) 
                                                      VALUES (?, ?, ?, ?, ?)";
                        
                        using (OleDbCommand cmdTempi = new OleDbCommand(queryTempiIntervalli, conn))
                        {
                            cmdTempi.Parameters.AddWithValue("?", userId.Value);
                            cmdTempi.Parameters.AddWithValue("?", DateTime.Parse(startTime));
                            cmdTempi.Parameters.AddWithValue("?", DateTime.Now);
                            cmdTempi.Parameters.AddWithValue("?", currentTime);
                            cmdTempi.Parameters.AddWithValue("?", modalita);
                            cmdTempi.ExecuteNonQuery();
                        }
                    }

                    // Aggiorna StatoTimer
                    string queryUpdate = @"UPDATE StatoTimer 
                                         SET CurrentTime = ?, 
                                             RecordTime = ?, 
                                             StartTime = ?, 
                                             LastUpdate = Now(),
                                             Modalita = ?
                                         WHERE UtenteID = ?";
                    
                    using (OleDbCommand cmdUpdate = new OleDbCommand(queryUpdate, conn))
                    {
                        cmdUpdate.Parameters.AddWithValue("?", currentTime);
                        cmdUpdate.Parameters.AddWithValue("?", recordTime);
                        cmdUpdate.Parameters.AddWithValue("?", DateTime.Parse(startTime));
                        cmdUpdate.Parameters.AddWithValue("?", modalita);
                        cmdUpdate.Parameters.AddWithValue("?", userId.Value);
                        
                        int rowsAffected = cmdUpdate.ExecuteNonQuery();

                        if (rowsAffected == 0)
                        {
                            // Se non esiste, inserisci nuovo record
                            string queryInsert = @"INSERT INTO StatoTimer 
                                                 (UtenteID, CurrentTime, RecordTime, StartTime, LastUpdate, Modalita) 
                                                 VALUES (?, ?, ?, ?, Now(), ?)";
                            
                            using (OleDbCommand cmdInsert = new OleDbCommand(queryInsert, conn))
                            {
                                cmdInsert.Parameters.AddWithValue("?", userId.Value);
                                cmdInsert.Parameters.AddWithValue("?", currentTime);
                                cmdInsert.Parameters.AddWithValue("?", recordTime);
                                cmdInsert.Parameters.AddWithValue("?", DateTime.Parse(startTime));
                                cmdInsert.Parameters.AddWithValue("?", modalita);
                                cmdInsert.ExecuteNonQuery();
                            }
                        }
                    }

                    return new { success = true };
                }
            }
            catch (Exception ex)
            {
                return new { success = false, error = ex.Message };
            }
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public static object GetStatoTimer()
        {
            try
            {
                var context = System.Web.HttpContext.Current;
                int? userId = null;
                
                if (context.Session["UtenteID"] != null)
                {
                    userId = Convert.ToInt32(context.Session["UtenteID"]);
                }

                if (!userId.HasValue)
                {
                    throw new Exception("Utente non autenticato");
                }

                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();
                    string query = @"SELECT CurrentTime, RecordTime, StartTime, LastUpdate 
                                   FROM StatoTimer 
                                   WHERE UtenteID = ?";
                    
                    using (OleDbCommand cmd = new OleDbCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId.Value);
                        using (OleDbDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                DateTime lastUpdate = Convert.ToDateTime(reader["LastUpdate"]);
                                DateTime startTime = Convert.ToDateTime(reader["StartTime"]);
                                
                                return new { 
                                    hasActiveTimer = true,
                                    currentTime = Convert.ToInt32(reader["CurrentTime"]),
                                    recordTime = Convert.ToInt32(reader["RecordTime"]),
                                    startTime = startTime.ToString("yyyy-MM-ddTHH:mm:ss"),
                                    lastUpdate = lastUpdate.ToString("yyyy-MM-ddTHH:mm:ss")
                                };
                            }
                            
                            return new { 
                                hasActiveTimer = false,
                                currentTime = 0,
                                recordTime = 0,
                                startTime = "",
                                lastUpdate = ""
                            };
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return new { success = false, error = ex.Message };
            }
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public static object GetTimerState()
        {
            try
            {
                var context = System.Web.HttpContext.Current;
                int? userId = null;
                
                if (context.Session["UtenteID"] != null)
                {
                    userId = Convert.ToInt32(context.Session["UtenteID"]);
                }

                if (!userId.HasValue)
                {
                    throw new Exception("Utente non autenticato");
                }

                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();
                    string query = @"SELECT StartTime, LastUpdate, CurrentTime 
                                   FROM StatoTimer 
                                   WHERE UtenteID = ?";
                    
                    using (OleDbCommand cmd = new OleDbCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId.Value);
                        using (OleDbDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                return new { 
                                    success = true,
                                    startTime = Convert.ToDateTime(reader["StartTime"]).ToString("yyyy-MM-ddTHH:mm:ss"),
                                    lastUpdate = Convert.ToDateTime(reader["LastUpdate"]).ToString("yyyy-MM-ddTHH:mm:ss"),
                                    currentTime = Convert.ToInt32(reader["CurrentTime"])
                                };
                            }
                        }
                    }
                }
                return new { success = false };
            }
            catch (Exception ex)
            {
                return new { success = false, error = ex.Message };
            }
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public static object UpdateUserRecord(int recordTime, int currentTime)
        {
            LogError("=== INIZIO UpdateUserRecord ===");
            LogError("Record Time ricevuto: " + recordTime);
            LogError("Current Time ricevuto: " + currentTime);
            
            try
            {
                var context = System.Web.HttpContext.Current;
                int? userId = null;
                
                if (context.Session["UtenteID"] != null)
                {
                    userId = Convert.ToInt32(context.Session["UtenteID"]);
                    LogError("UserID trovato: " + userId);
                }

                if (!userId.HasValue)
                {
                    LogError("ERRORE: Utente non autenticato");
                    throw new Exception("Utente non autenticato");
                }

                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();
                    LogError("Connessione DB aperta");
                    
                    string queryUpdate = @"UPDATE StatoTimer 
                                         SET RecordTime = ?, CurrentTime = ?
                                         WHERE UtenteID = ?";
                    
                    using (OleDbCommand cmdUpdate = new OleDbCommand(queryUpdate, conn))
                    {
                        cmdUpdate.Parameters.AddWithValue("?", recordTime);
                        cmdUpdate.Parameters.AddWithValue("?", currentTime);
                        cmdUpdate.Parameters.AddWithValue("?", userId.Value);
                        int rowsAffected = cmdUpdate.ExecuteNonQuery();
                        LogError("Righe aggiornate: " + rowsAffected);

                        if (rowsAffected == 0)
                        {
                            LogError("Nessuna riga aggiornata, provo a inserire...");
                            string queryInsert = @"INSERT INTO StatoTimer 
                                                (UtenteID, RecordTime, CurrentTime, StartTime, LastUpdate) 
                                                VALUES (?, ?, ?, Now(), Now())";
                            
                            using (OleDbCommand cmdInsert = new OleDbCommand(queryInsert, conn))
                            {
                                cmdInsert.Parameters.AddWithValue("?", userId.Value);
                                cmdInsert.Parameters.AddWithValue("?", recordTime);
                                cmdInsert.Parameters.AddWithValue("?", currentTime);
                                int insertedRows = cmdInsert.ExecuteNonQuery();
                                LogError("Righe inserite: " + insertedRows);
                            }
                        }
                    }
                    
                    LogError("=== FINE UpdateUserRecord ===");
                    return new { success = true, bestTime = recordTime };
                }
            }
            catch (Exception ex)
            {
                LogError("ERRORE in UpdateUserRecord: " + ex.Message);
                LogError("Stack trace: " + ex.StackTrace);
                return new { success = false, error = ex.Message };
            }
        }

        private static void WriteToLog(string message)
        {
            try 
            {
                string logPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/error_log.txt");
                string logMessage = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + " - [RECORD] " + message + Environment.NewLine;
                System.IO.File.AppendAllText(logPath, logMessage);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Errore durante il logging: " + ex.Message);
            }
        }

        private static void LogError(string message)
        {
            try 
            {
                string logPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/error_log.txt");
                string logMessage = DateTime.Now.ToString() + " - " + message + Environment.NewLine;
                System.IO.File.AppendAllText(logPath, logMessage);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Errore durante il logging: " + ex.Message);
            }
        }

        // Aggiungiamo il metodo per caricare il record
        private void LoadUserRecord()
        {
            try
            {
                if (Session["UtenteID"] == null) return;
                
                int userId = Convert.ToInt32(Session["UtenteID"]);
                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();
                    string query = @"SELECT TOP 1 RecordTime 
                                   FROM StatoTimer 
                                   WHERE UtenteID = ? 
                                   ORDER BY RecordTime DESC";
                    
                    using (OleDbCommand cmd = new OleDbCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId);
                        object result = cmd.ExecuteScalar();
                        
                        if (result != null && result != DBNull.Value)
                        {
                            int recordTime = Convert.ToInt32(result);
                            Session["UserRecord"] = recordTime;
                            
                            // Impostiamo il valore iniziale nel client
                            string formattedTime = FormatTime(recordTime);
                            string script = "if(typeof updateUserRecord === 'function') { " +
                                          "    updateUserRecord(" + recordTime + ", '" + formattedTime + "');" +
                                          "} else { " +
                                          "    console.error('updateUserRecord non trovata');" +
                                          "}";
                            ClientScript.RegisterStartupScript(this.GetType(), "SetInitialRecord", script, true);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                LogError("Errore nel caricamento del record utente: " + ex.Message);
            }
        }

        // Aggiungiamo un metodo helper per formattare il tempo
        private string FormatTime(int seconds)
        {
            int h = seconds / 3600;
            int m = (seconds % 3600) / 60;
            int s = seconds % 60;
            return string.Format("{0:D2}:{1:D2}:{2:D2}", h, m, s);
        }
    }
} 