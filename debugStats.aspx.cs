using System;
using System.Data;
using System.Data.OleDb;
using System.Configuration;
using System.Text;

namespace NomeProgetto
{
    public partial class debugStats : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                CaricaDebugInfo();
            }
        }

        private void CaricaDebugInfo()
        {
            StringBuilder queryLog = new StringBuilder();
            try
            {
                int userId = GetUserId();
                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();

                    // Query panoramica
                    string queryPanoramica = @"SELECT COUNT(*) as TotaleRecord, 
                                             Format(Min(DataOraInizio),'dd/mm/yyyy hh:nn:ss') as PrimaData, 
                                             Format(Max(DataOraInizio),'dd/mm/yyyy hh:nn:ss') as UltimaData 
                                             FROM TempiIntervalli 
                                             WHERE UtenteID = ?";
                    using (OleDbCommand cmd = new OleDbCommand(queryPanoramica, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId);
                        using (OleDbDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                lblTotaleRecord.Text = reader["TotaleRecord"].ToString();
                                lblPrimaData.Text = reader["PrimaData"].ToString();
                                lblUltimaData.Text = reader["UltimaData"].ToString();
                            }
                        }
                    }

                    // Query raw data per debug
                    string queryRaw = @"SELECT TOP 10 ID, DataOraInizio, DurataSec 
                                      FROM TempiIntervalli 
                                      WHERE UtenteID = ? 
                                      ORDER BY DataOraInizio DESC";
                    
                    queryLog.AppendLine("Ultimi 10 record:");
                    using (OleDbCommand cmd = new OleDbCommand(queryRaw, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId);
                        using (OleDbDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                // Gestione sicura della data
                                string dataStr = "N/A";
                                try
                                {
                                    var dataValue = reader["DataOraInizio"];
                                    if (dataValue != DBNull.Value)
                                    {
                                        if (dataValue is DateTime)
                                        {
                                            dataStr = ((DateTime)dataValue).ToString("dd/MM/yyyy HH:mm:ss");
                                        }
                                        else
                                        {
                                            dataStr = dataValue.ToString();
                                        }
                                    }
                                }
                                catch (Exception ex)
                                {
                                    dataStr = "Errore Data: " + ex.Message;
                                }

                                queryLog.AppendLine(string.Format(
                                    "ID: {0}, Data: {1}, Durata: {2}",
                                    reader["ID"],
                                    dataStr,
                                    reader["DurataSec"]
                                ));
                            }
                        }
                    }

                    // Query settimana corrente
                    string querySettimanaCorrente = @"SELECT COUNT(*) 
                                                  FROM TempiIntervalli 
                                                  WHERE UtenteID = ? 
                                                  AND DataOraInizio >= DateAdd('d', -7, Now())";
                    
                    using (OleDbCommand cmd = new OleDbCommand(querySettimanaCorrente, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId);
                        object result = cmd.ExecuteScalar();
                        lblSettimanaCorrente.Text = result != null ? result.ToString() : "0";
                    }

                    // Query settimana scorsa
                    string querySettimanaScorsa = @"SELECT COUNT(*) 
                                                  FROM TempiIntervalli 
                                                  WHERE UtenteID = ? 
                                                  AND DataOraInizio >= DateAdd('d', -14, Now()) 
                                                  AND DataOraInizio < DateAdd('d', -7, Now())";
                    
                    using (OleDbCommand cmd = new OleDbCommand(querySettimanaScorsa, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId);
                        object result = cmd.ExecuteScalar();
                        lblSettimanaScorsa.Text = result != null ? result.ToString() : "0";
                    }

                    // Query ore
                    string queryOre = @"SELECT 
                                        DataOraInizio,
                                        DatePart('h', DataOraInizio) as Ora, 
                                        COUNT(*) as Conteggio
                                      FROM TempiIntervalli 
                                      WHERE UtenteID = ?
                                      GROUP BY DataOraInizio, DatePart('h', DataOraInizio)
                                      ORDER BY DataOraInizio DESC";
                    
                    DataTable dtOre = new DataTable();
                    using (OleDbCommand cmd = new OleDbCommand(queryOre, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId);
                        using (OleDbDataAdapter da = new OleDbDataAdapter(cmd))
                        {
                            da.Fill(dtOre);
                        }
                    }
                    gvOre.DataSource = dtOre;
                    gvOre.DataBind();

                    lblQueries.Text = queryLog.ToString();
                }
            }
            catch (Exception ex)
            {
                lblQueries.Text = "Errore: " + ex.Message + "\n\nStack Trace: " + ex.StackTrace + 
                                 "\n\nQuery in esecuzione: " + queryLog.ToString();
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