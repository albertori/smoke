using System;
using System.Data.OleDb;
using System.Configuration;
using System.Web;
using System.Web.Security;

namespace NomeProgetto
{
    public partial class login : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                TestDatabaseConnection();

                if (Session["UtenteID"] != null)
                {
                    Response.Redirect("benefici.aspx");
                }
            }
        }

        private void TestDatabaseConnection()
        {
            try
            {
                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();
                    System.Diagnostics.Debug.WriteLine("Connessione al DB aperta con successo");
                    
                    using (OleDbCommand cmd = new OleDbCommand("SELECT COUNT(*) FROM Utenti", conn))
                    {
                        int count = Convert.ToInt32(cmd.ExecuteScalar());
                        System.Diagnostics.Debug.WriteLine("Numero di utenti nel DB: " + count);
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Errore test DB: " + ex.Message);
                lblErrore.Text = "Errore di connessione al database.";
                lblErrore.Visible = true;
            }
        }

        protected void btnAccedi_Click(object sender, EventArgs e)
        {
            string email = txtEmail.Text.Trim().ToLower();
            System.Diagnostics.Debug.WriteLine("Tentativo di login per email: " + email);
            
            try
            {
                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();
                    System.Diagnostics.Debug.WriteLine("Connessione aperta per login");

                    string queryCheck = "SELECT COUNT(*) FROM Utenti WHERE Email = ?";
                    int existingUsers = 0;
                    
                    using (OleDbCommand cmd = new OleDbCommand(queryCheck, conn))
                    {
                        cmd.Parameters.AddWithValue("?", email);
                        existingUsers = Convert.ToInt32(cmd.ExecuteScalar());
                        System.Diagnostics.Debug.WriteLine("Utenti trovati con questa email: " + existingUsers);
                    }

                    if (existingUsers > 0)
                    {
                        using (OleDbCommand cmd = new OleDbCommand("SELECT ID FROM Utenti WHERE Email = ?", conn))
                        {
                            cmd.Parameters.AddWithValue("?", email);
                            int utenteId = Convert.ToInt32(cmd.ExecuteScalar());
                            System.Diagnostics.Debug.WriteLine("Utente esistente trovato con ID: " + utenteId);
                            LoginSuccesso(utenteId, email);
                        }
                    }
                    else
                    {
                        System.Diagnostics.Debug.WriteLine("Creazione nuovo utente");
                        string queryInsert = "INSERT INTO Utenti (Email, DataRegistrazione, UltimoAccesso) VALUES (?, Now(), Now())";
                        int newUserId = 0;

                        using (OleDbCommand cmdInsert = new OleDbCommand(queryInsert, conn))
                        {
                            cmdInsert.Parameters.AddWithValue("?", email);
                            int rowsAffected = cmdInsert.ExecuteNonQuery();
                            System.Diagnostics.Debug.WriteLine("Righe inserite: " + rowsAffected);

                            if (rowsAffected > 0)
                            {
                                cmdInsert.CommandText = "SELECT @@IDENTITY";
                                newUserId = Convert.ToInt32(cmdInsert.ExecuteScalar());
                                System.Diagnostics.Debug.WriteLine("Nuovo utente creato con ID: " + newUserId);
                                LoginSuccesso(newUserId, email);
                            }
                            else
                            {
                                throw new Exception("Errore nell'inserimento del nuovo utente");
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("ERRORE CRITICO: " + ex.Message);
                System.Diagnostics.Debug.WriteLine("Stack trace: " + ex.StackTrace);
                lblErrore.Text = "Errore durante l'accesso: " + ex.Message;
                lblErrore.Visible = true;
            }
        }

        private void LoginSuccesso(int utenteId, string email)
        {
            try
            {
                System.Diagnostics.Debug.WriteLine("Inizio LoginSuccesso per utente " + utenteId);
                
                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();
                    string queryUpdate = "UPDATE Utenti SET UltimoAccesso = Now() WHERE ID = ?";
                    using (OleDbCommand cmd = new OleDbCommand(queryUpdate, conn))
                    {
                        cmd.Parameters.AddWithValue("?", utenteId);
                        int rowsAffected = cmd.ExecuteNonQuery();
                        System.Diagnostics.Debug.WriteLine("Update UltimoAccesso righe modificate: " + rowsAffected);
                    }
                }

                Session["UtenteID"] = utenteId;
                Session["Email"] = email;
                System.Diagnostics.Debug.WriteLine("Sessione impostata");

                HttpCookie authCookie = new HttpCookie("UserAuth");
                authCookie.Value = utenteId.ToString() + "|" + email;
                authCookie.Expires = DateTime.Now.AddDays(30);
                Response.Cookies.Add(authCookie);
                System.Diagnostics.Debug.WriteLine("Cookie impostato");

                Response.Redirect("benefici.aspx");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Errore in LoginSuccesso: " + ex.Message);
                System.Diagnostics.Debug.WriteLine("Stack trace: " + ex.StackTrace);
                lblErrore.Text = "Errore durante l'accesso: " + ex.Message;
                lblErrore.Visible = true;
            }
        }
    }
} 