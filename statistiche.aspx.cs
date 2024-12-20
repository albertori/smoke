using System;
using System.Web;
using System.Web.Services;
using System.Web.Script.Services;
using System.Configuration;
using System.Data.OleDb;
using System.Collections.Generic;
using System.Web.UI;

namespace NomeProgetto
{
    public partial class statistiche : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                string email = "";
                
                if (Session["UtenteEmail"] != null)
                {
                    email = Session["UtenteEmail"].ToString();
                }
                else if (Session["Email"] != null)
                {
                    email = Session["Email"].ToString();
                }

                if (Request.Cookies["UserAuth"] != null)
                {
                    string cookieValue = Request.Cookies["UserAuth"].Value;
                    string[] authData = cookieValue.Split('|');
                    if (authData.Length >= 2)
                    {
                        email = HttpUtility.UrlDecode(authData[1]);
                    }
                }

                lblEmail.Text = string.IsNullOrEmpty(email) ? "Utente" : email;
                
                CaricaStatisticheBase();
            }
        }

        private static int GetUserId()
        {
            var context = System.Web.HttpContext.Current;
            int userId = 0;

            // Prova prima dalla sessione
            if (context.Session["UtenteID"] != null)
            {
                userId = Convert.ToInt32(context.Session["UtenteID"]);
                return userId;
            }

            // Se non c'è in sessione, prova dal cookie
            HttpCookie authCookie = context.Request.Cookies["UserAuth"];
            if (authCookie != null)
            {
                string[] authData = authCookie.Value.Split('|');
                if (authData.Length >= 1)
                {
                    if (int.TryParse(authData[0], out userId))
                    {
                        return userId;
                    }
                }
            }

            throw new Exception("Utente non autenticato");
        }

        private void CaricaStatisticheBase()
        {
            try
            {
                int userId = GetUserId();
                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();

                    // 1. Query totale sigarette - Modalità = False per "Ho Fumato"
                    string queryTotaleSigarette = @"
                        SELECT COUNT(*) as TotaleSigarette
                        FROM Progressi 
                        WHERE UtenteID = ? AND Modalita = False";

                    using (OleDbCommand cmdSigarette = new OleDbCommand(queryTotaleSigarette, conn))
                    {
                        cmdSigarette.Parameters.AddWithValue("?", userId);
                        object result = cmdSigarette.ExecuteScalar();
                        totaleSigarette.InnerText = (result != DBNull.Value) ? result.ToString() : "0";
                    }

                    // 2. Query tempi
                    string queryDettagli = @"
                        SELECT DataOra 
                        FROM Progressi 
                        WHERE UtenteID = ? AND Modalita = False
                        ORDER BY DataOra";

                    using (OleDbCommand cmdDettagli = new OleDbCommand(queryDettagli, conn))
                    {
                        cmdDettagli.Parameters.AddWithValue("?", userId);
                        using (OleDbDataReader reader = cmdDettagli.ExecuteReader())
                        {
                            List<DateTime> date = new List<DateTime>();
                            while (reader.Read())
                            {
                                date.Add(Convert.ToDateTime(reader["DataOra"]));
                            }

                            int totaleSecondi = 0;
                            int conteggio = 0;
                            int minSecondi = int.MaxValue;
                            int maxSecondi = 0;

                            for (int i = 0; i < date.Count - 1; i++)
                            {
                                int diffSeconds = (int)(date[i + 1] - date[i]).TotalSeconds;
                                if (diffSeconds > 0)
                                {
                                    totaleSecondi += diffSeconds;
                                    conteggio++;
                                    minSecondi = Math.Min(minSecondi, diffSeconds);
                                    maxSecondi = Math.Max(maxSecondi, diffSeconds);
                                }
                            }

                            if (conteggio > 0)
                            {
                                tempoTotale.InnerText = FormatTime(totaleSecondi);
                                tempoMedio.InnerText = FormatTime(totaleSecondi / conteggio);
                                tempoMinimo.InnerText = FormatTime(minSecondi);
                                tempoMassimo.InnerText = FormatTime(maxSecondi);
                            }
                        }
                    }

                    // ... resto del codice identico ma con Modalita = False ...
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Errore in CaricaStatisticheBase: " + ex.Message);
            }
        }

        private string FormatTime(object seconds)
        {
            if (seconds == DBNull.Value || seconds == null)
                return "00:00:00";

            int totalSeconds = Convert.ToInt32(seconds);
            TimeSpan time = TimeSpan.FromSeconds(totalSeconds);
            return time.ToString(@"hh\:mm\:ss");
        }

        protected void btnTornaBenefici_Click(object sender, EventArgs e)
        {
            Response.Redirect("benefici.aspx");
        }

        protected void btnAzzeraDati_Click(object sender, EventArgs e)
        {
            try
            {
                int userId = GetUserId();
                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();
                    
                    // Eliminiamo solo i record con Modalita = 0 (Ho Fumato)
                    string query = "DELETE FROM Progressi WHERE UtenteID = ? AND Modalita = 0";
                    
                    using (OleDbCommand cmd = new OleDbCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId);
                        cmd.ExecuteNonQuery();
                    }

                    // Azzera tutti i controlli
                    totaleSigarette.InnerText = "0";
                    tempoTotale.InnerText = "00:00:00";
                    tempoMedio.InnerText = "00:00:00";
                    tempoMinimo.InnerText = "00:00:00";
                    tempoMassimo.InnerText = "00:00:00";
                    oraCritica.InnerText = "-";
                    giornoCritico.InnerText = "-";
                    tentativiSettimanaCorrente.InnerText = "0";
                    tentativiSettimanaScorsa.InnerText = "0";
                    variazioneSettimanale.InnerText = "0%";
                    variazioneSettimanale.Attributes["class"] = "positive-change";
                }

                ClientScript.RegisterStartupScript(this.GetType(), "alertMessage", 
                    "alert('Tutte le statistiche sono state azzerate con successo.');", true);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Errore nell'eliminazione dei dati: " + ex.Message);
                ClientScript.RegisterStartupScript(this.GetType(), "alertMessage", 
                    "alert('Si è verificato un errore durante l\\'azzeramento delle statistiche.');", true);
            }
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public static object GetTempiResistenza()
        {
            List<string> logs = new List<string>();
            try
            {
                int userId = GetUserId();
                logs.Add(string.Format("GetTempiResistenza - UserID trovato: {0}", userId));

                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();
                    
                    // Query per recuperare tutte le date ordinate
                    string queryDate = @"
                        SELECT DataOra 
                        FROM Progressi 
                        WHERE UtenteID = ? AND Modalita = False
                        ORDER BY DataOra";

                    List<DateTime> date = new List<DateTime>();
                    Dictionary<int, int> oreCount = new Dictionary<int, int>();
                    Dictionary<DayOfWeek, int> giorniCount = new Dictionary<DayOfWeek, int>();

                    using (OleDbCommand cmdDate = new OleDbCommand(queryDate, conn))
                    {
                        cmdDate.Parameters.AddWithValue("?", userId);
                        using (OleDbDataReader reader = cmdDate.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                DateTime dataOra = Convert.ToDateTime(reader["DataOra"]);
                                date.Add(dataOra);

                                // Conteggio per ora
                                int ora = dataOra.Hour;
                                if (!oreCount.ContainsKey(ora))
                                    oreCount[ora] = 0;
                                oreCount[ora]++;

                                // Conteggio per giorno
                                DayOfWeek giorno = dataOra.DayOfWeek;
                                if (!giorniCount.ContainsKey(giorno))
                                    giorniCount[giorno] = 0;
                                giorniCount[giorno]++;
                            }
                        }
                    }

                    // Trova l'ora più critica
                    int oraCritica = -1;
                    int maxOraCount = 0;
                    foreach (var pair in oreCount)
                    {
                        if (pair.Value > maxOraCount)
                        {
                            maxOraCount = pair.Value;
                            oraCritica = pair.Key;
                        }
                    }

                    // Trova il giorno più critico
                    DayOfWeek giornoCritico = DayOfWeek.Sunday;
                    int maxGiornoCount = 0;
                    foreach (var pair in giorniCount)
                    {
                        if (pair.Value > maxGiornoCount)
                        {
                            maxGiornoCount = pair.Value;
                            giornoCritico = pair.Key;
                        }
                    }

                    // Converti il giorno in italiano
                    string giornoItaliano = "";
                    switch (giornoCritico)
                    {
                        case DayOfWeek.Monday: giornoItaliano = "Lunedì"; break;
                        case DayOfWeek.Tuesday: giornoItaliano = "Martedì"; break;
                        case DayOfWeek.Wednesday: giornoItaliano = "Mercoledì"; break;
                        case DayOfWeek.Thursday: giornoItaliano = "Giovedì"; break;
                        case DayOfWeek.Friday: giornoItaliano = "Venerdì"; break;
                        case DayOfWeek.Saturday: giornoItaliano = "Sabato"; break;
                        case DayOfWeek.Sunday: giornoItaliano = "Domenica"; break;
                    }

                    // Resto del codice esistente per i calcoli dei tempi...
                    int totaleSecondi = 0;
                    int conteggio = 0;
                    int minSecondi = int.MaxValue;
                    int maxSecondi = 0;

                    for (int i = 0; i < date.Count - 1; i++)
                    {
                        int diffSeconds = (int)(date[i + 1] - date[i]).TotalSeconds;
                        if (diffSeconds > 0)
                        {
                            totaleSecondi += diffSeconds;
                            conteggio++;
                            minSecondi = Math.Min(minSecondi, diffSeconds);
                            maxSecondi = Math.Max(maxSecondi, diffSeconds);
                        }
                    }

                    // Calcolo statistiche settimanali
                    DateTime oggi = DateTime.Now;
                    DateTime inizioSettimanaCorrente = oggi.AddDays(-7);
                    DateTime inizioSettimanaScorsa = oggi.AddDays(-14);

                    int settimanaCorrente = 0;
                    int settimanaScorsa = 0;

                    foreach (DateTime d in date)
                    {
                        if (d >= inizioSettimanaCorrente)
                        {
                            settimanaCorrente++;
                        }
                        else if (d >= inizioSettimanaScorsa && d < inizioSettimanaCorrente)
                        {
                            settimanaScorsa++;
                        }
                    }

                    // Calcolo variazione percentuale
                    double variazione = 0;
                    if (settimanaScorsa > 0)
                    {
                        variazione = ((double)(settimanaCorrente - settimanaScorsa) / settimanaScorsa) * 100;
                    }

                    int mediaSecondi = conteggio > 0 ? totaleSecondi / conteggio : 0;
                    minSecondi = minSecondi == int.MaxValue ? 0 : minSecondi;

                    // Formatta l'ora critica
                    string oraCriticaFormattata = oraCritica >= 0 ? 
                        string.Format("{0:D2}:00", oraCritica) : "--:--";

                    logs.Add(string.Format("Ora critica: {0}", oraCriticaFormattata));
                    logs.Add(string.Format("Giorno critico: {0}", giornoItaliano));

                    return new {
                        success = true,
                        tempoTotale = totaleSecondi,
                        tempoMedio = mediaSecondi,
                        tempoMinimo = minSecondi,
                        tempoMassimo = maxSecondi,
                        settimanaCorrente = settimanaCorrente,
                        settimanaScorsa = settimanaScorsa,
                        variazionePercentuale = variazione,
                        oraCritica = oraCriticaFormattata,
                        giornoCritico = giornoItaliano,
                        logs = logs
                    };
                }
            }
            catch (Exception ex)
            {
                logs.Add(string.Format("Errore generale: {0}", ex.Message));
                logs.Add(string.Format("StackTrace: {0}", ex.StackTrace));
                return new { success = false, error = ex.Message, logs = logs };
            }
        }
    }
} 