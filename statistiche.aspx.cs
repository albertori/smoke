using System;
using System.Web.Services;
using System.Web.Script.Services;
using System.Configuration;
using System.Data.OleDb;
using System.Collections.Generic;

namespace NomeProgetto
{
    public partial class statistiche : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
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

                    // Ora critica
                    string queryOraCritica = @"
                        SELECT TOP 1 CInt(Format(DataOraInizio,'hh')) as Ora, COUNT(*) as Conteggio
                        FROM TempiIntervalli 
                        WHERE UtenteID = ?
                        GROUP BY CInt(Format(DataOraInizio,'hh'))
                        ORDER BY COUNT(*) DESC";

                    using (OleDbCommand cmd = new OleDbCommand(queryOraCritica, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId);
                        using (OleDbDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                int ora = Convert.ToInt32(reader["Ora"]);
                                string periodo = ora >= 12 ? "PM" : "AM";
                                int oraFormattata = ora > 12 ? ora - 12 : ora;
                                if (ora == 0) oraFormattata = 12;
                                if (ora == 12) periodo = "PM";
                                oraCritica.InnerText = string.Format("{0:00}:00 {1}", oraFormattata, periodo);
                            }
                        }
                    }

                    // Giorno critico
                    string queryGiornoCritico = @"
                        SELECT TOP 1 Weekday(DataOraInizio) as Giorno, COUNT(*) as Conteggio
                        FROM TempiIntervalli 
                        WHERE UtenteID = ?
                        GROUP BY Weekday(DataOraInizio)
                        ORDER BY COUNT(*) DESC";

                    using (OleDbCommand cmd = new OleDbCommand(queryGiornoCritico, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId);
                        using (OleDbDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                int giorno = Convert.ToInt32(reader["Giorno"]);
                                string[] giorni = { "Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab" };
                                giornoCritico.InnerText = giorni[giorno];
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
    }
} 