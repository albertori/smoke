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
                CaricaStatisticheAvanzate();
            }
        }

        private void CaricaStatisticheBase()
        {
            try
            {
                int userId = GetUserId();
                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();
                    string query = @"SELECT COUNT(*) as TotaleTentativi, 
                                      SUM(DurataSec) as DurataTotale,
                                      AVG(DurataSec) as DurataMedia,
                                      MIN(DurataSec) as DurataMinima,
                                      MAX(DurataSec) as DurataMassima
                               FROM TempiIntervalli 
                               WHERE UtenteID = ?";

                    using (OleDbCommand cmd = new OleDbCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId);
                        using (OleDbDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                totaleTentativi.InnerText = reader["TotaleTentativi"].ToString();
                                
                                int durataSecondi = Convert.ToInt32(reader["DurataTotale"]);
                                TimeSpan durataTotale = TimeSpan.FromSeconds(durataSecondi);
                                tempoTotale.InnerText = string.Format("{0:D2}:{1:D2}:{2:D2}", 
                                    (int)durataTotale.TotalHours, 
                                    durataTotale.Minutes, 
                                    durataTotale.Seconds);

                                if (reader["DurataMedia"] != DBNull.Value)
                                {
                                    int durataMediaSecondi = Convert.ToInt32(reader["DurataMedia"]);
                                    TimeSpan durataMedia = TimeSpan.FromSeconds(durataMediaSecondi);
                                    tempoMedio.InnerText = string.Format("{0:D2}:{1:D2}:{2:D2}",
                                        (int)durataMedia.TotalHours,
                                        durataMedia.Minutes,
                                        durataMedia.Seconds);
                                }

                                if (reader["DurataMinima"] != DBNull.Value)
                                {
                                    int durataMinSecondi = Convert.ToInt32(reader["DurataMinima"]);
                                    TimeSpan durataMin = TimeSpan.FromSeconds(durataMinSecondi);
                                    tempoMinimo.InnerText = string.Format("{0:D2}:{1:D2}:{2:D2}",
                                        (int)durataMin.TotalHours,
                                        durataMin.Minutes,
                                        durataMin.Seconds);
                                }

                                if (reader["DurataMassima"] != DBNull.Value)
                                {
                                    int durataMaxSecondi = Convert.ToInt32(reader["DurataMassima"]);
                                    TimeSpan durataMax = TimeSpan.FromSeconds(durataMaxSecondi);
                                    tempoMassimo.InnerText = string.Format("{0:D2}:{1:D2}:{2:D2}",
                                        (int)durataMax.TotalHours,
                                        durataMax.Minutes,
                                        durataMax.Seconds);
                                }
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

        private void CaricaStatisticheAvanzate()
        {
            try
            {
                int userId = GetUserId();
                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();

                    // Verifica dati esistenti
                    string queryConteggio = "SELECT COUNT(*) FROM TempiIntervalli WHERE UtenteID = ?";
                    using (OleDbCommand cmd = new OleDbCommand(queryConteggio, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId);
                        int conteggio = Convert.ToInt32(cmd.ExecuteScalar());
                        
                        if (conteggio == 0)
                        {
                            oraCritica.InnerText = "-";
                            giornoCritico.InnerText = "-";
                            tentativiSettimanaCorrente.InnerText = "0";
                            tentativiSettimanaScorsa.InnerText = "0";
                            variazioneSettimanale.InnerText = "0%";
                            return;
                        }
                    }

                    // Ora critica - usando Format per estrarre l'ora
                    string queryOraCritica = @"
                        SELECT TOP 1 
                            CInt(Format(DataOraInizio,'h')) as Ora,
                            COUNT(*) as Conteggio
                        FROM TempiIntervalli 
                        WHERE UtenteID = ? 
                            AND DataOraInizio IS NOT NULL
                        GROUP BY CInt(Format(DataOraInizio,'h'))
                        HAVING COUNT(*) > 0
                        ORDER BY COUNT(*) DESC, CInt(Format(DataOraInizio,'h')) ASC";

                    using (OleDbCommand cmd = new OleDbCommand(queryOraCritica, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId);
                        using (OleDbDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read() && !reader.IsDBNull(0))
                            {
                                int ora = Convert.ToInt32(reader["Ora"]);
                                int conteggio = Convert.ToInt32(reader["Conteggio"]);
                                string periodo = ora >= 12 ? "PM" : "AM";
                                int oraFormattata = ora > 12 ? ora - 12 : ora;
                                if (ora == 0) oraFormattata = 12;
                                if (ora == 12) periodo = "PM";
                                oraCritica.InnerText = string.Format("{0:00}:00 {1} ({2} tentativi)", 
                                    oraFormattata, periodo, conteggio);
                            }
                            else
                            {
                                oraCritica.InnerText = "-";
                            }
                        }
                    }

                    // Giorno critico
                    string queryGiornoCritico = @"
                        SELECT TOP 1 
                            CInt(Format(DataOraInizio,'w')) as Giorno,
                            COUNT(*) as Conteggio
                        FROM TempiIntervalli 
                        WHERE UtenteID = ? 
                            AND DataOraInizio IS NOT NULL
                        GROUP BY CInt(Format(DataOraInizio,'w'))
                        HAVING COUNT(*) > 0
                        ORDER BY COUNT(*) DESC, CInt(Format(DataOraInizio,'w')) ASC";

                    using (OleDbCommand cmd = new OleDbCommand(queryGiornoCritico, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId);
                        using (OleDbDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read() && !reader.IsDBNull(0))
                            {
                                int giorno = Convert.ToInt32(reader["Giorno"]) - 1; // Format('w') restituisce 1-7
                                int conteggio = Convert.ToInt32(reader["Conteggio"]);
                                string[] giorni = { "Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab" };
                                giornoCritico.InnerText = string.Format("{0} ({1} tentativi)", 
                                    giorni[giorno], conteggio);
                            }
                            else
                            {
                                giornoCritico.InnerText = "-";
                            }
                        }
                    }

                    // Confronto settimanale
                    string querySettimanaCorrente = @"
                        SELECT COUNT(*) 
                        FROM TempiIntervalli 
                        WHERE UtenteID = ? 
                        AND DataOraInizio >= DateAdd('d', -7, Now())";

                    string querySettimanaScorsa = @"
                        SELECT COUNT(*) 
                        FROM TempiIntervalli 
                        WHERE UtenteID = ? 
                        AND DataOraInizio >= DateAdd('d', -14, Now()) 
                        AND DataOraInizio < DateAdd('d', -7, Now())";

                    using (OleDbCommand cmd = new OleDbCommand(querySettimanaCorrente, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId);
                        object result = cmd.ExecuteScalar();
                        int settimanaCorrente = (result != null && result != DBNull.Value) ? Convert.ToInt32(result) : 0;
                        tentativiSettimanaCorrente.InnerText = settimanaCorrente.ToString();
                    }

                    using (OleDbCommand cmd = new OleDbCommand(querySettimanaScorsa, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId);
                        object result = cmd.ExecuteScalar();
                        int settimanaScorsa = (result != null && result != DBNull.Value) ? Convert.ToInt32(result) : 0;
                        tentativiSettimanaScorsa.InnerText = settimanaScorsa.ToString();

                        // Calcola variazione percentuale
                        int settimanaCorrente = Convert.ToInt32(tentativiSettimanaCorrente.InnerText);
                        if (settimanaScorsa > 0)
                        {
                            double variazione = ((double)(settimanaCorrente - settimanaScorsa) / settimanaScorsa) * 100;
                            string segno = variazione >= 0 ? "+" : string.Empty;
                            variazioneSettimanale.InnerText = string.Format("{0}{1:0.0}%", segno, variazione);
                            variazioneSettimanale.Attributes["class"] = variazione <= 0 ? "positive-change" : "negative-change";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Errore in CaricaStatisticheAvanzate: " + ex.Message);
                System.Diagnostics.Debug.WriteLine("Stack Trace: " + ex.StackTrace);
                
                // Aggiungiamo più dettagli nel log per il debug
                System.Diagnostics.Debug.WriteLine("Query Ora Critica risultato vuoto o errore");
                oraCritica.InnerText = "-";
                giornoCritico.InnerText = "-";
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
                    
                    // Eliminiamo tutti i record dalla tabella TempiIntervalli
                    string query = "DELETE FROM TempiIntervalli WHERE UtenteID = ?";
                    
                    using (OleDbCommand cmd = new OleDbCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId);
                        cmd.ExecuteNonQuery();
                    }

                    // Azzeriamo tutti i controlli
                    totaleTentativi.InnerText = "0";
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

                // Opzionale: mostriamo un messaggio di conferma
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