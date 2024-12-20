using System;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Configuration;
using System.Data.OleDb;
using System.Web.Services;
using System.Web.Script.Services;
using System.Collections.Generic;

namespace NomeProgetto
{
    public partial class nonStatistiche : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                string email = "";
                
                // Debug sessione
                if (Session["UtenteEmail"] != null)
                {
                    email = Session["UtenteEmail"].ToString();
                }
                else if (Session["Email"] != null)
                {
                    email = Session["Email"].ToString();
                }

                // Debug cookie
                if (Request.Cookies["UserAuth"] != null)
                {
                    string cookieValue = Request.Cookies["UserAuth"].Value;
                    System.Diagnostics.Debug.WriteLine("Cookie value: " + cookieValue);
                    
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

        private int GetUserId()
        {
            if (Session["UtenteID"] != null)
            {
                return Convert.ToInt32(Session["UtenteID"]);
            }
            else if (Request.Cookies["UserAuth"] != null)
            {
                string[] authData = Request.Cookies["UserAuth"].Value.Split('|');
                if (authData.Length == 2)
                {
                    return Convert.ToInt32(authData[0]);
                }
            }
            throw new Exception("Utente non autenticato");
        }

        // Metodi WebMethod specifici per le statistiche della modalità "Ho Fumato"
        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public static object GetStatisticheFumate()
        {
            // Implementa la logica per recuperare le statistiche
            // specifiche per la modalità "Ho Fumato"
            return new { /* dati statistiche */ };
        }

        private void CaricaStatisticheBase()
        {
            try
            {
                int userId = GetUserId();
                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();

                    // 1. Query totale sigarette
                    string queryTotaleSigarette = @"
                        SELECT COUNT(*) as TotaleSigarette
                        FROM Progressi 
                        WHERE UtenteID = ? AND Modalita = True";

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
                        WHERE UtenteID = ? AND Modalita = True
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

                    // 3. Query ora critica
                    string queryOraCritica = @"
                        SELECT TOP 1 
                            Format(DataOra,'hh:nn') as Ora,
                            COUNT(*) as Conteggio
                        FROM Progressi 
                        WHERE UtenteID = ? 
                            AND Modalita = True
                            AND DataOra >= DateAdd('d', -30, Now())
                        GROUP BY Format(DataOra,'hh:nn')
                        ORDER BY COUNT(*) DESC";

                    using (OleDbCommand cmdOraCritica = new OleDbCommand(queryOraCritica, conn))
                    {
                        cmdOraCritica.Parameters.AddWithValue("?", userId);
                        using (OleDbDataReader reader = cmdOraCritica.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                string ora = reader["Ora"].ToString();
                                int conteggio = Convert.ToInt32(reader["Conteggio"]);
                                oraCritica.InnerText = ora + " (" + conteggio + " sigarette)";
                            }
                        }
                    }

                    // 4. Query giorno critico
                    string queryGiornoCritico = @"
                        SELECT TOP 1 
                            Format(DataOra,'dddd') as Giorno,
                            COUNT(*) as Conteggio
                        FROM Progressi 
                        WHERE UtenteID = ? 
                            AND Modalita = True
                            AND DataOra >= DateAdd('d', -30, Now())
                        GROUP BY Format(DataOra,'dddd')
                        ORDER BY COUNT(*) DESC";

                    using (OleDbCommand cmdGiornoCritico = new OleDbCommand(queryGiornoCritico, conn))
                    {
                        cmdGiornoCritico.Parameters.AddWithValue("?", userId);
                        using (OleDbDataReader reader = cmdGiornoCritico.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                string giorno = reader["Giorno"].ToString();
                                int conteggio = Convert.ToInt32(reader["Conteggio"]);
                                giornoCritico.InnerText = giorno + " (" + conteggio + " sigarette)";
                            }
                        }
                    }

                    // 5. Query progresso settimanale
                    string queryProgresso = @"
                        SELECT DataOra 
                        FROM Progressi 
                        WHERE UtenteID = ? 
                            AND Modalita = True 
                            AND DataOra >= DateAdd('d', -14, Now())
                        ORDER BY DataOra";

                    using (OleDbCommand cmdProgresso = new OleDbCommand(queryProgresso, conn))
                    {
                        cmdProgresso.Parameters.AddWithValue("?", userId);
                        using (OleDbDataReader reader = cmdProgresso.ExecuteReader())
                        {
                            int settimanaCorrente = 0;
                            int settimanaScorsa = 0;
                            DateTime oggi = DateTime.Now;
                            DateTime inizioSettimanaCorrente = oggi.AddDays(-7);
                            DateTime inizioSettimanaScorsa = oggi.AddDays(-14);

                            while (reader.Read())
                            {
                                DateTime dataRecord = Convert.ToDateTime(reader["DataOra"]);
                                if (dataRecord >= inizioSettimanaCorrente)
                                {
                                    settimanaCorrente++;
                                }
                                else if (dataRecord >= inizioSettimanaScorsa)
                                {
                                    settimanaScorsa++;
                                }
                            }

                            tentativiSettimanaCorrente.InnerText = settimanaCorrente.ToString();
                            tentativiSettimanaScorsa.InnerText = settimanaScorsa.ToString();

                            if (settimanaScorsa > 0)
                            {
                                double variazione = ((double)(settimanaCorrente - settimanaScorsa) / settimanaScorsa) * 100;
                                string segno = variazione >= 0 ? "+" : "";
                                variazioneSettimanale.InnerText = string.Format("{0}{1:0.0}%", segno, variazione);
                                variazioneSettimanale.Attributes["class"] = 
                                    variazione <= 0 ? "positive-change" : "negative-change";
                            }
                            else if (settimanaCorrente > 0)
                            {
                                variazioneSettimanale.InnerText = "Nuovi dati";
                                variazioneSettimanale.Attributes["class"] = "neutral-change";
                            }
                            else
                            {
                                variazioneSettimanale.InnerText = "0%";
                                variazioneSettimanale.Attributes["class"] = "neutral-change";
                            }
                        }
                    }
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
                    
                    // Eliminiamo solo i record con Modalita = 1 (Ho Fumato)
                    string query = "DELETE FROM Progressi WHERE UtenteID = ? AND Modalita = 1";
                    
                    using (OleDbCommand cmd = new OleDbCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId);
                        cmd.ExecuteNonQuery();
                    }

                    // Azzeriamo tutti i controlli
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
    }
} 