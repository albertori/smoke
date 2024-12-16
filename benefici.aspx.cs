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
        public static object GetDatiIniziali()
        {
            try
            {
                // Ottieni l'ID utente dalla sessione
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
                    
                    string query = "SELECT TOP 1 Sigarette, Risparmio, Catrame, Tempo FROM Progressi";
                    if (userId.HasValue)
                    {
                        query += " WHERE UtenteID = ?";
                    }
                    query += " ORDER BY ID DESC";

                    using (OleDbCommand cmdRead = new OleDbCommand(query, conn))
                    {
                        if (userId.HasValue)
                        {
                            cmdRead.Parameters.AddWithValue("?", userId.Value);
                        }

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
                        userId = userId
                    };
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Errore in GetDatiIniziali: " + ex.Message);
                System.Diagnostics.Debug.WriteLine("Stack trace: " + ex.StackTrace);
                throw new Exception("Errore nel recupero dei dati");
            }
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public static object IncrementaContatore()
        {
            try
            {
                // Ottieni l'ID utente dalla sessione
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
                    
                    // Leggi i valori attuali
                    string queryRead = "SELECT TOP 1 Sigarette, Risparmio, Catrame, Tempo FROM Progressi";
                    if (userId.HasValue)
                    {
                        queryRead += " WHERE UtenteID = ?";
                    }
                    queryRead += " ORDER BY ID DESC";

                    using (OleDbCommand cmdRead = new OleDbCommand(queryRead, conn))
                    {
                        if (userId.HasValue)
                        {
                            cmdRead.Parameters.AddWithValue("?", userId.Value);
                        }

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

                    // Inserisci nuova riga
                    string queryInsert = "INSERT INTO Progressi (DataOra, Sigarette, Risparmio, Catrame, Tempo";
                    if (userId.HasValue)
                    {
                        queryInsert += ", UtenteID";
                    }
                    queryInsert += ") VALUES (Now(), ?, ?, ?, ?";
                    if (userId.HasValue)
                    {
                        queryInsert += ", ?";
                    }
                    queryInsert += ")";

                    using (OleDbCommand cmdInsert = new OleDbCommand(queryInsert, conn))
                    {
                        cmdInsert.Parameters.AddWithValue("?", sigarette);
                        cmdInsert.Parameters.AddWithValue("?", risparmio);
                        cmdInsert.Parameters.AddWithValue("?", catrame);
                        cmdInsert.Parameters.AddWithValue("?", tempo);
                        if (userId.HasValue)
                        {
                            cmdInsert.Parameters.AddWithValue("?", userId.Value);
                        }
                        cmdInsert.ExecuteNonQuery();
                    }

                    return new {
                        sigarette = sigarette,
                        risparmio = risparmio,
                        catrame = catrame,
                        tempo = tempo,
                        userId = userId
                    };
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Errore in IncrementaContatore: " + ex.Message);
                System.Diagnostics.Debug.WriteLine("Stack trace: " + ex.StackTrace);
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
            try
            {
                var context = System.Web.HttpContext.Current;
                System.Diagnostics.Debug.WriteLine("=== INIZIO SALVA STATO TIMER ===");
                System.Diagnostics.Debug.WriteLine(string.Format("CurrentTime: {0}, RecordTime: {1}, StartTime: {2}, IsLogout: {3}", 
                    currentTime, recordTime, startTime, isLogout));
                
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
                    
                    if (!isLogout)
                    {
                        string queryUpdate = @"UPDATE StatoTimer 
                                             SET CurrentTime = @CurrentTime, 
                                                 RecordTime = @RecordTime, 
                                                 StartTime = @StartTime, 
                                                 LastUpdate = Now() 
                                             WHERE UtenteID = @UtenteID";
                        
                        using (OleDbCommand cmd = new OleDbCommand(queryUpdate, conn))
                        {
                            cmd.Parameters.Add("@CurrentTime", OleDbType.Integer).Value = currentTime;
                            cmd.Parameters.Add("@RecordTime", OleDbType.Integer).Value = recordTime;
                            cmd.Parameters.Add("@StartTime", OleDbType.Date).Value = DateTime.Now;
                            cmd.Parameters.Add("@UtenteID", OleDbType.Integer).Value = userId.Value;
                            
                            int rowsAffected = cmd.ExecuteNonQuery();
                            System.Diagnostics.Debug.WriteLine(string.Format("Righe aggiornate: {0}", rowsAffected));

                            if (rowsAffected == 0)
                            {
                                string queryInsert = @"INSERT INTO StatoTimer 
                                                     (UtenteID, CurrentTime, RecordTime, StartTime, LastUpdate) 
                                                     VALUES (@UtenteID, @CurrentTime, @RecordTime, @StartTime, Now())";
                                
                                using (OleDbCommand cmdInsert = new OleDbCommand(queryInsert, conn))
                                {
                                    cmdInsert.Parameters.Add("@UtenteID", OleDbType.Integer).Value = userId.Value;
                                    cmdInsert.Parameters.Add("@CurrentTime", OleDbType.Integer).Value = currentTime;
                                    cmdInsert.Parameters.Add("@RecordTime", OleDbType.Integer).Value = recordTime;
                                    cmdInsert.Parameters.Add("@StartTime", OleDbType.Date).Value = DateTime.Now;
                                    cmdInsert.ExecuteNonQuery();
                                    System.Diagnostics.Debug.WriteLine("Nuovo record inserito");
                                }
                            }
                        }
                    }
                    else
                    {
                        string queryDelete = "DELETE FROM StatoTimer WHERE UtenteID = @UtenteID";
                        using (OleDbCommand cmd = new OleDbCommand(queryDelete, conn))
                        {
                            cmd.Parameters.Add("@UtenteID", OleDbType.Integer).Value = userId.Value;
                            cmd.ExecuteNonQuery();
                            System.Diagnostics.Debug.WriteLine("Record eliminato per logout");
                        }
                    }

                    return new { success = true };
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(string.Format("ERRORE: {0}", ex.Message));
                System.Diagnostics.Debug.WriteLine(string.Format("Stack trace: {0}", ex.StackTrace));
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
    }
} 