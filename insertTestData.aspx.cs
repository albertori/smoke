using System;
using System.Data.OleDb;
using System.Configuration;

namespace NomeProgetto
{
    public partial class insertTestData : System.Web.UI.Page
    {
        protected void btnInserisci_Click(object sender, EventArgs e)
        {
            try
            {
                int userId = Convert.ToInt32(txtUserID.Text);
                int numTentativi = Convert.ToInt32(txtNumTentativi.Text);
                bool isSettimanaScorsa = rbSettimanaScorsa.Checked;

                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();
                    Random rnd = new Random();

                    for (int i = 0; i < numTentativi; i++)
                    {
                        // Genera una data casuale
                        int giorniIndietro = isSettimanaScorsa ? rnd.Next(8, 14) : rnd.Next(0, 7);
                        int ore = rnd.Next(0, 24);
                        int minuti = rnd.Next(0, 60);
                        int durataSec = rnd.Next(60, 7200); // tra 1 minuto e 2 ore

                        string query = @"INSERT INTO TempiIntervalli 
                                        (UtenteID, DataOraInizio, DataOraFine, DurataSec) 
                                        VALUES (?, 
                                                DateAdd('h', ?, DateAdd('n', ?, DateAdd('d', -?, Date()))), 
                                                DateAdd('s', ?, DateAdd('h', ?, DateAdd('n', ?, DateAdd('d', -?, Date())))), 
                                                ?)";

                        using (OleDbCommand cmd = new OleDbCommand(query, conn))
                        {
                            DateTime dataInizio = DateTime.Now.AddDays(-giorniIndietro)
                                                            .AddHours(ore - DateTime.Now.Hour)
                                                            .AddMinutes(minuti - DateTime.Now.Minute)
                                                            .AddSeconds(-DateTime.Now.Second);

                            cmd.Parameters.AddWithValue("?", userId);
                            cmd.Parameters.AddWithValue("?", ore);
                            cmd.Parameters.AddWithValue("?", minuti);
                            cmd.Parameters.AddWithValue("?", giorniIndietro);
                            // Parametri per DataOraFine
                            cmd.Parameters.AddWithValue("?", durataSec);
                            cmd.Parameters.AddWithValue("?", ore);
                            cmd.Parameters.AddWithValue("?", minuti);
                            cmd.Parameters.AddWithValue("?", giorniIndietro);
                            // Durata
                            cmd.Parameters.AddWithValue("?", durataSec);
                            cmd.ExecuteNonQuery();
                        }
                    }
                }

                lblResult.Text = string.Format("Inseriti con successo {0} tentativi per la {1}!", 
                    numTentativi, 
                    isSettimanaScorsa ? "settimana scorsa" : "settimana corrente");
                lblResult.CssClass = "alert alert-success mt-3";
            }
            catch (Exception ex)
            {
                lblResult.Text = "Errore: " + ex.Message;
                lblResult.CssClass = "alert alert-danger mt-3";
            }
        }

        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                // Se disponibile, precompila l'ID utente dalla sessione
                if (Session["UtenteID"] != null)
                {
                    txtUserID.Text = Session["UtenteID"].ToString();
                }
            }
        }
    }
} 