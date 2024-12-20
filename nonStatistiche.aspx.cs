using System;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Configuration;
using System.Data.OleDb;
using System.Web.Services;
using System.Web.Script.Services;

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
                    
                    // Query per il totale sigarette fumate
                    string queryTotaleSigarette = @"SELECT COUNT(*) as TotaleSigarette 
                                                  FROM Progressi 
                                                  WHERE UtenteID = ? AND Modalita = True";

                    using (OleDbCommand cmdSigarette = new OleDbCommand(queryTotaleSigarette, conn))
                    {
                        cmdSigarette.Parameters.AddWithValue("?", userId);
                        object result = cmdSigarette.ExecuteScalar();
                        totaleSigarette.InnerText = (result != DBNull.Value) ? result.ToString() : "0";
                    }

                    // Query per i tempi tra le sigarette
                    string queryTempi = @"SELECT 
                                          SUM(DurataSec) as TempoTotale,
                                          AVG(DurataSec) as TempoMedio,
                                          MIN(DurataSec) as TempoMinimo,
                                          MAX(DurataSec) as TempoMassimo
                                        FROM TempiIntervalli 
                                        WHERE UtenteID = ?";

                    using (OleDbCommand cmdTempi = new OleDbCommand(queryTempi, conn))
                    {
                        cmdTempi.Parameters.AddWithValue("?", userId);
                        using (OleDbDataReader reader = cmdTempi.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                // Formattazione tempi
                                object tempoTotaleObj = reader["TempoTotale"];
                                object tempoMedioObj = reader["TempoMedio"];
                                object tempoMinimoObj = reader["TempoMinimo"];
                                object tempoMassimoObj = reader["TempoMassimo"];

                                tempoTotale.InnerText = FormatTime(tempoTotaleObj);
                                tempoMedio.InnerText = FormatTime(tempoMedioObj);
                                tempoMinimo.InnerText = FormatTime(tempoMinimoObj);
                                tempoMassimo.InnerText = FormatTime(tempoMassimoObj);
                            }
                        }
                    }

                    // Query per l'ora critica
                    string queryOraCritica = @"
                        SELECT TOP 1 
                            DatePart('h', DataOra) as Ora,
                            COUNT(*) as Conteggio
                        FROM Progressi 
                        WHERE UtenteID = ? AND Modalita = True
                        GROUP BY DatePart('h', DataOra)
                        HAVING COUNT(*) > 0
                        ORDER BY COUNT(*) DESC";

                    using (OleDbCommand cmdOraCritica = new OleDbCommand(queryOraCritica, conn))
                    {
                        cmdOraCritica.Parameters.AddWithValue("?", userId);
                        using (OleDbDataReader reader = cmdOraCritica.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                int ora = Convert.ToInt32(reader["Ora"]);
                                int conteggio = Convert.ToInt32(reader["Conteggio"]);
                                oraCritica.InnerText = string.Format("{0:D2}:00 ({1} sigarette)", 
                                    ora, conteggio);
                            }
                            else
                            {
                                oraCritica.InnerText = "-";
                            }
                        }
                    }

                    // Query per il giorno critico
                    string queryGiornoCritico = @"
                        SELECT TOP 1 
                            DatePart('w', DataOra) as Giorno,
                            COUNT(*) as Conteggio
                        FROM Progressi 
                        WHERE UtenteID = ? AND Modalita = True
                        GROUP BY DatePart('w', DataOra)
                        HAVING COUNT(*) > 0
                        ORDER BY COUNT(*) DESC";

                    using (OleDbCommand cmdGiornoCritico = new OleDbCommand(queryGiornoCritico, conn))
                    {
                        cmdGiornoCritico.Parameters.AddWithValue("?", userId);
                        using (OleDbDataReader reader = cmdGiornoCritico.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                int giorno = Convert.ToInt32(reader["Giorno"]); // 1=Domenica, 7=Sabato
                                int conteggio = Convert.ToInt32(reader["Conteggio"]);
                                string[] giorni = { "Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab" };
                                giornoCritico.InnerText = string.Format("{0} ({1} sigarette)", 
                                    giorni[giorno - 1], conteggio);
                            }
                            else
                            {
                                giornoCritico.InnerText = "-";
                            }
                        }
                    }

                    // Query per il progresso settimanale
                    string queryProgresso = @"
                        SELECT 
                            (SELECT COUNT(*) 
                             FROM Progressi 
                             WHERE UtenteID = ? 
                                AND Modalita = True
                                AND DataOra >= DateAdd('d', -7, Now())
                            ) as SettimanaCorrente,
                            (SELECT COUNT(*) 
                             FROM Progressi 
                             WHERE UtenteID = ? 
                                AND Modalita = True
                                AND DataOra >= DateAdd('d', -14, Now()) 
                                AND DataOra < DateAdd('d', -7, Now())
                            ) as SettimanaScorsa";

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

                                tentativiSettimanaCorrente.InnerText = settimanaCorrente.ToString();
                                tentativiSettimanaScorsa.InnerText = settimanaScorsa.ToString();

                                if (settimanaScorsa > 0)
                                {
                                    double variazione = ((double)(settimanaCorrente - settimanaScorsa) / settimanaScorsa) * 100;
                                    string segno = variazione >= 0 ? "+" : "";
                                    variazioneSettimanale.InnerText = string.Format("{0}{1:0.0}%", segno, variazione);
                                    
                                    // Per le sigarette fumate, una diminuzione è positiva
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
                                    variazioneSettimanale.InnerText = "Nessun dato";
                                    variazioneSettimanale.Attributes["class"] = "neutral-change";
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