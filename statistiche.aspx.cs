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
                    
                    // Query per il totale tentativi dalla tabella Progressi
                    string queryTotaleTentativi = @"SELECT COUNT(*) as TotaleTentativi 
                                                  FROM Progressi 
                                                  WHERE UtenteID = ? AND Modalita = 0";

                    // Query completa per tutti i tempi
                    string queryTempi = @"SELECT 
                                          SUM(DurataSec) as TempoTotale,
                                          AVG(DurataSec) as TempoMedio,
                                          MIN(DurataSec) as TempoMinimo,
                                          MAX(DurataSec) as TempoMassimo
                                        FROM TempiIntervalli 
                                        WHERE UtenteID = ?";

                    // Query per il progresso settimanale
                    string queryProgresso = @"
                        SELECT 
                            (SELECT COUNT(*) 
                             FROM Progressi 
                             WHERE UtenteID = ? 
                                AND Modalita = 0
                                AND DataOra >= DateAdd('d', -7, Now())
                            ) as SettimanaCorrente,
                            (SELECT COUNT(*) 
                             FROM Progressi 
                             WHERE UtenteID = ? 
                                AND Modalita = 0
                                AND DataOra >= DateAdd('d', -14, Now()) 
                                AND DataOra < DateAdd('d', -7, Now())
                            ) as SettimanaScorsa";

                    // Query per l'ora critica
                    string queryOraCritica = @"
                        SELECT TOP 1 
                            DatePart('h', DataOra) as Ora,
                            COUNT(*) as Conteggio
                        FROM Progressi 
                        WHERE UtenteID = ? 
                            AND Modalita = 0
                        GROUP BY DatePart('h', DataOra)
                        HAVING COUNT(*) > 0
                        ORDER BY COUNT(*) DESC";

                    // Query per il giorno critico
                    string queryGiornoCritico = @"
                        SELECT TOP 1 
                            DatePart('w', DataOra) as Giorno,
                            COUNT(*) as Conteggio
                        FROM Progressi 
                        WHERE UtenteID = ? 
                            AND Modalita = 0
                        GROUP BY DatePart('w', DataOra)
                        HAVING COUNT(*) > 0
                        ORDER BY COUNT(*) DESC";

                    // Ottieni totale tentativi
                    using (OleDbCommand cmdTentativi = new OleDbCommand(queryTotaleTentativi, conn))
                    {
                        cmdTentativi.Parameters.AddWithValue("?", userId);
                        object result = cmdTentativi.ExecuteScalar();
                        totaleTentativi.InnerText = (result != DBNull.Value) ? result.ToString() : "0";
                    }

                    // Ottieni tutti i tempi
                    using (OleDbCommand cmdTempi = new OleDbCommand(queryTempi, conn))
                    {
                        cmdTempi.Parameters.AddWithValue("?", userId);
                        using (OleDbDataReader reader = cmdTempi.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                // Tempo totale
                                if (!reader.IsDBNull(reader.GetOrdinal("TempoTotale")))
                                {
                                    int secondiTotali = Convert.ToInt32(reader["TempoTotale"]);
                                    TimeSpan durataTotale = TimeSpan.FromSeconds(secondiTotali);
                                    tempoTotale.InnerText = string.Format("{0:D2}:{1:D2}:{2:D2}",
                                        (int)durataTotale.TotalHours,
                                        durataTotale.Minutes,
                                        durataTotale.Seconds);
                                }
                                else
                                {
                                    tempoTotale.InnerText = "00:00:00";
                                }

                                // Tempo medio
                                if (!reader.IsDBNull(reader.GetOrdinal("TempoMedio")))
                                {
                                    int secondiMedi = Convert.ToInt32(reader["TempoMedio"]);
                                    TimeSpan durataMedia = TimeSpan.FromSeconds(secondiMedi);
                                    tempoMedio.InnerText = string.Format("{0:D2}:{1:D2}:{2:D2}",
                                        (int)durataMedia.TotalHours,
                                        durataMedia.Minutes,
                                        durataMedia.Seconds);
                                }
                                else
                                {
                                    tempoMedio.InnerText = "00:00:00";
                                }

                                // Tempo minimo
                                if (!reader.IsDBNull(reader.GetOrdinal("TempoMinimo")))
                                {
                                    int secondiMinimi = Convert.ToInt32(reader["TempoMinimo"]);
                                    TimeSpan durataMinima = TimeSpan.FromSeconds(secondiMinimi);
                                    tempoMinimo.InnerText = string.Format("{0:D2}:{1:D2}:{2:D2}",
                                        (int)durataMinima.TotalHours,
                                        durataMinima.Minutes,
                                        durataMinima.Seconds);
                                }
                                else
                                {
                                    tempoMinimo.InnerText = "00:00:00";
                                }

                                // Tempo massimo
                                if (!reader.IsDBNull(reader.GetOrdinal("TempoMassimo")))
                                {
                                    int secondiMassimi = Convert.ToInt32(reader["TempoMassimo"]);
                                    TimeSpan durataMassima = TimeSpan.FromSeconds(secondiMassimi);
                                    tempoMassimo.InnerText = string.Format("{0:D2}:{1:D2}:{2:D2}",
                                        (int)durataMassima.TotalHours,
                                        durataMassima.Minutes,
                                        durataMassima.Seconds);
                                }
                                else
                                {
                                    tempoMassimo.InnerText = "00:00:00";
                                }
                            }
                            else
                            {
                                // Se non ci sono dati, inizializza tutti i tempi a zero
                                tempoTotale.InnerText = "00:00:00";
                                tempoMedio.InnerText = "00:00:00";
                                tempoMinimo.InnerText = "00:00:00";
                                tempoMassimo.InnerText = "00:00:00";
                            }
                        }
                    }

                    // Ottieni ora critica
                    using (OleDbCommand cmdOra = new OleDbCommand(queryOraCritica, conn))
                    {
                        cmdOra.Parameters.AddWithValue("?", userId);
                        using (OleDbDataReader reader = cmdOra.ExecuteReader())
                        {
                            if (reader.Read() && !reader.IsDBNull(0))
                            {
                                int ora = Convert.ToInt32(reader["Ora"]);
                                int conteggio = Convert.ToInt32(reader["Conteggio"]);
                                string periodo = ora >= 12 ? "PM" : "AM";
                                int oraFormattata = ora > 12 ? ora - 12 : ora;
                                if (ora == 0) oraFormattata = 12; // Mezzanotte
                                if (ora == 12) periodo = "PM"; // Mezzogiorno
                                oraCritica.InnerText = string.Format("{0:00}:00 {1} ({2} tentativi)", 
                                    oraFormattata, periodo, conteggio);
                            }
                            else
                            {
                                oraCritica.InnerText = "-";
                            }
                        }
                    }

                    // Ottieni giorno critico
                    using (OleDbCommand cmdGiorno = new OleDbCommand(queryGiornoCritico, conn))
                    {
                        cmdGiorno.Parameters.AddWithValue("?", userId);
                        using (OleDbDataReader reader = cmdGiorno.ExecuteReader())
                        {
                            if (reader.Read() && !reader.IsDBNull(0))
                            {
                                int giorno = Convert.ToInt32(reader["Giorno"]); // 1=Domenica, 7=Sabato
                                int conteggio = Convert.ToInt32(reader["Conteggio"]);
                                string[] giorni = { "Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab" };
                                giornoCritico.InnerText = string.Format("{0} ({1} tentativi)", 
                                    giorni[giorno - 1], conteggio);
                            }
                            else
                            {
                                giornoCritico.InnerText = "-";
                            }
                        }
                    }

                    // Ottieni il progresso settimanale
                    using (OleDbCommand cmdProgresso = new OleDbCommand(queryProgresso, conn))
                    {
                        cmdProgresso.Parameters.AddWithValue("?", userId);
                        cmdProgresso.Parameters.AddWithValue("?", userId);
                        
                        using (OleDbDataReader reader = cmdProgresso.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                int settimanaCorrente = Convert.ToInt32(reader["SettimanaCorrente"]);
                                int settimanaScorsa = Convert.ToInt32(reader["SettimanaScorsa"]);

                                // Aggiorna i contatori delle settimane
                                tentativiSettimanaCorrente.InnerText = settimanaCorrente.ToString();
                                tentativiSettimanaScorsa.InnerText = settimanaScorsa.ToString();

                                // Calcola e formatta la variazione percentuale
                                if (settimanaScorsa > 0)
                                {
                                    double variazione = ((double)(settimanaCorrente - settimanaScorsa) / settimanaScorsa) * 100;
                                    string segno = variazione >= 0 ? "+" : "";
                                    variazioneSettimanale.InnerText = string.Format("{0}{1:0.0}%", segno, variazione);
                                    
                                    // Per le voglie di fumare, una diminuzione è positiva
                                    variazioneSettimanale.Attributes["class"] = 
                                        variazione <= 0 ? "positive-change" : "negative-change";
                                }
                                else if (settimanaCorrente > 0)
                                {
                                    // Se la settimana scorsa era 0 ma questa settimana abbiamo dati
                                    variazioneSettimanale.InnerText = "Nuovi dati";
                                    variazioneSettimanale.Attributes["class"] = "neutral-change";
                                }
                                else
                                {
                                    // Se non ci sono dati in entrambe le settimane
                                    variazioneSettimanale.InnerText = "Nessun dato";
                                    variazioneSettimanale.Attributes["class"] = "neutral-change";
                                }
                            }
                            else
                            {
                                // In caso di errore nella lettura
                                tentativiSettimanaCorrente.InnerText = "0";
                                tentativiSettimanaScorsa.InnerText = "0";
                                variazioneSettimanale.InnerText = "Nessun dato";
                                variazioneSettimanale.Attributes["class"] = "neutral-change";
                            }
                        }
                    }

                    // ... resto del codice per altre statistiche ...
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