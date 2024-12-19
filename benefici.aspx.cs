using System;
using System.Web.Services;
using System.Web.Script.Services;
using System.Configuration;
using System.Data.OleDb;

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
                    // Usa la tabella StatoTimer invece di TempiIntervalli
                    string query = @"SELECT TOP 1 RecordTime 
                                   FROM StatoTimer 
                                   WHERE UtenteID = ? 
                                   ORDER BY RecordTime DESC";
                    
                    using (OleDbCommand cmd = new OleDbCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId.Value);
                        object result = cmd.ExecuteScalar();
                        
                        return new { 
                            success = true,
                            bestTime = result != null ? Convert.ToInt32(result) : 0
                        };
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
        public static object SalvaStatoTimer(int currentTime, int recordTime, string startTime, bool isLogout)
        {
            LogError("=== INIZIO SALVA STATO TIMER (DETTAGLI RICHIESTA) ===");
            LogError("Raw Request Data: " + System.Web.HttpContext.Current.Request.Form);
            LogError("Content Type: " + System.Web.HttpContext.Current.Request.ContentType);
            LogError("HTTP Method: " + System.Web.HttpContext.Current.Request.HttpMethod);
            LogError(string.Format("Parametri: currentTime={0}, recordTime={1}, startTime={2}, isLogout={3}", 
                currentTime, recordTime, startTime, isLogout));
            
            var context = System.Web.HttpContext.Current;
            try
            {
                LogError("=== INIZIO SALVA STATO TIMER ===");
                LogError(string.Format("CurrentTime: {0}, RecordTime: {1}, StartTime: {2}, IsLogout: {3}", 
                    currentTime, recordTime, startTime, isLogout));
                
                int? userId = null;
                if (context.Session["UtenteID"] != null)
                {
                    userId = Convert.ToInt32(context.Session["UtenteID"]);
                    LogError("UserID trovato: " + userId);
                }

                if (!userId.HasValue)
                {
                    LogError("Errore: Utente non autenticato");
                    throw new Exception("Utente non autenticato");
                }

                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();
                    LogError("Connessione al database aperta");
                    
                    if (!isLogout)
                    {
                        LogError("Tentativo di aggiornamento/inserimento record...");
                        // Prima verifichiamo se esiste già un record
                        string queryCheck = "SELECT COUNT(*) FROM StatoTimer WHERE UtenteID = ?";
                        int existingRecords = 0;
                        
                        using (OleDbCommand cmdCheck = new OleDbCommand(queryCheck, conn))
                        {
                            cmdCheck.Parameters.Add("?", OleDbType.Integer).Value = userId.Value;
                            existingRecords = Convert.ToInt32(cmdCheck.ExecuteScalar());
                            LogError("Record esistenti per l'utente: " + existingRecords);
                        }

                        if (existingRecords > 0)
                        {
                            LogError("Aggiornamento record esistente...");
                            string queryUpdate = @"UPDATE StatoTimer 
                                                 SET CurrentTime = ?, 
                                                     RecordTime = ?, 
                                                     StartTime = ?, 
                                                     LastUpdate = Now() 
                                                 WHERE UtenteID = ?";
                            
                            using (OleDbCommand cmd = new OleDbCommand(queryUpdate, conn))
                            {
                                cmd.Parameters.Add("?", OleDbType.Integer).Value = currentTime;
                                cmd.Parameters.Add("?", OleDbType.Integer).Value = recordTime;
                                cmd.Parameters.Add("?", OleDbType.Date).Value = DateTime.Parse(startTime).ToLocalTime();
                                cmd.Parameters.Add("?", OleDbType.Integer).Value = userId.Value;
                                
                                int rowsAffected = cmd.ExecuteNonQuery();
                                LogError("Righe aggiornate in StatoTimer: " + rowsAffected);
                            }
                        }
                        else
                        {
                            LogError("Inserimento nuovo record...");
                            string queryInsert = @"INSERT INTO StatoTimer 
                                                 (UtenteID, CurrentTime, RecordTime, StartTime, LastUpdate) 
                                                 VALUES (?, ?, ?, ?, Now())";
                            
                            using (OleDbCommand cmdInsert = new OleDbCommand(queryInsert, conn))
                            {
                                cmdInsert.Parameters.Add("?", OleDbType.Integer).Value = userId.Value;
                                cmdInsert.Parameters.Add("?", OleDbType.Integer).Value = currentTime;
                                cmdInsert.Parameters.Add("?", OleDbType.Integer).Value = recordTime;
                                cmdInsert.Parameters.Add("?", OleDbType.Date).Value = DateTime.Parse(startTime).ToLocalTime();
                                
                                try
                                {
                                    int rowsAffectedInsert = cmdInsert.ExecuteNonQuery();
                                    LogError("Righe inserite in StatoTimer: " + rowsAffectedInsert);
                                }
                                catch (Exception ex)
                                {
                                    LogError("Errore durante l'inserimento: " + ex.Message);
                                    LogError("Query: " + queryInsert);
                                    LogError("Parametri: UtenteID=" + userId.Value + 
                                            ", CurrentTime=" + currentTime + 
                                            ", RecordTime=" + recordTime + 
                                            ", StartTime=" + DateTime.Parse(startTime).ToLocalTime());
                                    throw;
                                }
                            }
                        }
                    }
                    else
                    {
                        LogError("Esecuzione logout, salvataggio record finale...");
                        // Prima salviamo i dati in TempiIntervalli
                        string queryTempiIntervalli = @"INSERT INTO TempiIntervalli 
                                                      (UtenteID, DataOraInizio, DataOraFine, DurataSec) 
                                                      VALUES (?, ?, ?, ?)";
                        
                        using (OleDbCommand cmdTempi = new OleDbCommand(queryTempiIntervalli, conn))
                        {
                            cmdTempi.Parameters.Add("?", OleDbType.Integer).Value = userId.Value;
                            cmdTempi.Parameters.Add("?", OleDbType.Date).Value = DateTime.Parse(startTime).ToLocalTime();
                            cmdTempi.Parameters.Add("?", OleDbType.Date).Value = DateTime.Now;
                            cmdTempi.Parameters.Add("?", OleDbType.Integer).Value = currentTime;
                            
                            int rowsAffectedTempi = cmdTempi.ExecuteNonQuery();
                            LogError("Righe inserite in TempiIntervalli: " + rowsAffectedTempi);
                        }

                        // Prima di eliminare, inseriamo o aggiorniamo in StatoTimer
                        string queryCheck = "SELECT COUNT(*) FROM StatoTimer WHERE UtenteID = ?";
                        int existingRecords = 0;
                        
                        using (OleDbCommand cmdCheck = new OleDbCommand(queryCheck, conn))
                        {
                            cmdCheck.Parameters.Add("?", OleDbType.Integer).Value = userId.Value;
                            existingRecords = Convert.ToInt32(cmdCheck.ExecuteScalar());
                            LogError("Record esistenti per l'utente: " + existingRecords);
                        }

                        if (existingRecords > 0)
                        {
                            LogError("Aggiornamento record esistente...");
                            string queryUpdate = @"UPDATE StatoTimer 
                                                 SET CurrentTime = ?, 
                                                     RecordTime = ?, 
                                                     StartTime = ?, 
                                                     LastUpdate = Now() 
                                                 WHERE UtenteID = ?";
                            
                            using (OleDbCommand cmd = new OleDbCommand(queryUpdate, conn))
                            {
                                cmd.Parameters.Add("?", OleDbType.Integer).Value = currentTime;
                                cmd.Parameters.Add("?", OleDbType.Integer).Value = recordTime;
                                cmd.Parameters.Add("?", OleDbType.Date).Value = DateTime.Parse(startTime).ToLocalTime();
                                cmd.Parameters.Add("?", OleDbType.Integer).Value = userId.Value;
                                
                                int rowsAffected = cmd.ExecuteNonQuery();
                                LogError("Righe aggiornate in StatoTimer: " + rowsAffected);
                            }
                        }
                        else
                        {
                            LogError("Inserimento nuovo record...");
                            string queryInsert = @"INSERT INTO StatoTimer 
                                                 (UtenteID, CurrentTime, RecordTime, StartTime, LastUpdate) 
                                                 VALUES (?, ?, ?, ?, Now())";
                            
                            using (OleDbCommand cmdInsert = new OleDbCommand(queryInsert, conn))
                            {
                                cmdInsert.Parameters.Add("?", OleDbType.Integer).Value = userId.Value;
                                cmdInsert.Parameters.Add("?", OleDbType.Integer).Value = currentTime;
                                cmdInsert.Parameters.Add("?", OleDbType.Integer).Value = recordTime;
                                cmdInsert.Parameters.Add("?", OleDbType.Date).Value = DateTime.Parse(startTime).ToLocalTime();
                                
                                int rowsAffectedInsert = cmdInsert.ExecuteNonQuery();
                                LogError("Righe inserite in StatoTimer: " + rowsAffectedInsert);
                            }
                        }
                    }

                    LogError("=== FINE SALVA STATO TIMER ===");
                    return new { success = true };
                }
            }
            catch (Exception ex)
            {
                LogError("=== ERRORE IN SALVA STATO TIMER ===");
                LogError("Messaggio: " + ex.Message);
                LogError("Stack trace: " + ex.StackTrace);
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
    }
} 