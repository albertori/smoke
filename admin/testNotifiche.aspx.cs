using System;
using System.Data.OleDb;
using System.Configuration;

namespace NomeProgetto.Admin
{
    public partial class TestNotifiche : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                CaricaUtenti();
            }
        }

        private void CaricaUtenti()
        {
            using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
            {
                conn.Open();
                string query = @"SELECT U.ID, U.Email 
                               FROM Utenti U 
                               ORDER BY U.Email";

                using (OleDbCommand cmd = new OleDbCommand(query, conn))
                {
                    using (OleDbDataReader reader = cmd.ExecuteReader())
                    {
                        ddlUtenti.Items.Clear();
                        while (reader.Read())
                        {
                            string email = reader["Email"].ToString();
                            string userId = reader["ID"].ToString();
                            ddlUtenti.Items.Add(new System.Web.UI.WebControls.ListItem(email, userId));
                        }
                    }
                }
            }
        }

        protected void btnInviaNotifica_Click(object sender, EventArgs e)
        {
            try
            {
                string userId = ddlUtenti.SelectedValue;
                litMessaggio.Text = "<div class='alert alert-info mt-3'>";
                litMessaggio.Text += "Inizio invio notifica per utente: " + userId + "<br/>";
                
                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();
                    litMessaggio.Text += "Connessione al database aperta<br/>";

                    string query = @"INSERT INTO Notifiche (UtenteID, Titolo, Messaggio, URL, DataCreazione, Inviata, Letta) 
                                   VALUES (?, ?, ?, ?, Now(), False, False)";

                    using (OleDbCommand cmd = new OleDbCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId);
                        cmd.Parameters.AddWithValue("?", txtTitolo.Text);
                        cmd.Parameters.AddWithValue("?", txtMessaggio.Text);
                        cmd.Parameters.AddWithValue("?", string.IsNullOrEmpty(txtUrl.Text) ? "/benefici.aspx" : txtUrl.Text);
                        
                        int rowsAffected = cmd.ExecuteNonQuery();
                        litMessaggio.Text += "Righe inserite: " + rowsAffected + "<br/>";

                        if (rowsAffected > 0)
                        {
                            // Verifica il conteggio delle notifiche non lette
                            using (OleDbCommand countCmd = new OleDbCommand(
                                "SELECT COUNT(*) FROM Notifiche WHERE UtenteID = ? AND Letta = False", conn))
                            {
                                countCmd.Parameters.AddWithValue("?", userId);
                                int unreadCount = Convert.ToInt32(countCmd.ExecuteScalar());
                                litMessaggio.Text += "Notifiche non lette totali: " + unreadCount + "<br/>";
                            }

                            litMessaggio.Text += "Notifica creata con successo!";
                        }
                        else
                        {
                            litMessaggio.Text += "Nessuna riga inserita";
                        }
                    }
                }
                litMessaggio.Text += "</div>";
            }
            catch (Exception ex)
            {
                litMessaggio.Text = "<div class='alert alert-danger mt-3'>Errore durante la creazione della notifica: " + ex.Message + "</div>";
            }
        }

        protected void btnTornaIndietro_Click(object sender, EventArgs e)
        {
            Response.Redirect("~/benefici.aspx");
        }
    }
} 