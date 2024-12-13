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
                context.Response.Write("<br>🚀 Inizio SalvaIntervallo");
                context.Response.Write("<br>Data Inizio ricevuta: '" + dataOraInizio + "'");
                context.Response.Write("<br>Data Fine ricevuta: '" + dataOraFine + "'");
                context.Response.Write("<br>Durata ricevuta: " + durataSec);
                
                int? userId = null;
                
                if (context.Session["UtenteID"] != null)
                {
                    userId = Convert.ToInt32(context.Session["UtenteID"]);
                    context.Response.Write("<br>UserID: " + userId);
                }

                if (!userId.HasValue)
                {
                    throw new Exception("Utente non autenticato");
                }

                // Prova a parsare le date
                try {
                    DateTime dtInizio = DateTime.Parse(dataOraInizio);
                    DateTime dtFine = DateTime.Parse(dataOraFine);
                    
                    context.Response.Write("<br>Data Inizio parsata: " + dtInizio);
                    context.Response.Write("<br>Data Fine parsata: " + dtFine);
                }
                catch (Exception ex) {
                    context.Response.Write("<br>❌ Errore parsing date: " + ex.Message);
                    throw;
                }

                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();
                    string query = "INSERT INTO TempiIntervalli (UtenteID, DataOraInizio, DataOraFine, DurataSec) VALUES (?, ?, ?, ?)";
                    
                    using (OleDbCommand cmd = new OleDbCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId.Value);
                        cmd.Parameters.AddWithValue("?", DateTime.Parse(dataOraInizio));
                        cmd.Parameters.AddWithValue("?", DateTime.Parse(dataOraFine));
                        cmd.Parameters.AddWithValue("?", durataSec);
                        
                        int rowsAffected = cmd.ExecuteNonQuery();
                        return new { 
                            success = true, 
                            rowsAffected = rowsAffected,
                            message = "Intervallo salvato con successo" 
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                context.Response.Write("<br>❌ Errore generale: " + ex.Message);
                context.Response.Write("<br>Stack trace: " + ex.StackTrace);
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
                    // Prendi il record migliore dell'utente
                    string query = @"SELECT TOP 1 DurataSec 
                                   FROM TempiIntervalli 
                                   WHERE UtenteID = ? 
                                   ORDER BY DurataSec DESC";
                    
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
    }
} 