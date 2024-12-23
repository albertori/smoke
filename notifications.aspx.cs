using System;
using System.Web.Services;
using System.Web.Script.Services;
using System.Configuration;
using System.Data.OleDb;
using System.Web;

namespace NomeProgetto
{
    public partial class notifications : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                if (Session["UtenteID"] != null)
                {
                    hdnUserId.Value = Session["UtenteID"].ToString();
                }
            }
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public static string GetVapidPublicKey()
        {
            return ConfigurationManager.AppSettings["VapidPublicKey"];
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public static object SaveSubscription(string subscription)
        {
            try
            {
                var context = HttpContext.Current;
                int userId = 0;

                if (context.Session["UtenteID"] != null)
                {
                    userId = Convert.ToInt32(context.Session["UtenteID"]);
                }
                else
                {
                    return new { success = false, error = "Utente non autenticato" };
                }

                using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
                {
                    conn.Open();

                    // Prima verifica se esiste già una sottoscrizione per questo utente
                    string checkQuery = @"SELECT ID FROM NotificheSubscriptions WHERE UtenteID = ?";
                    bool exists = false;
                    int subscriptionId = 0;

                    using (OleDbCommand cmd = new OleDbCommand(checkQuery, conn))
                    {
                        cmd.Parameters.AddWithValue("?", userId);
                        var result = cmd.ExecuteScalar();
                        if (result != null)
                        {
                            exists = true;
                            subscriptionId = Convert.ToInt32(result);
                        }
                    }

                    if (exists)
                    {
                        // Aggiorna la sottoscrizione esistente
                        string updateQuery = @"UPDATE NotificheSubscriptions 
                                            SET Subscription = ?, UltimoAggiornamento = Now()
                                            WHERE ID = ?";

                        using (OleDbCommand cmd = new OleDbCommand(updateQuery, conn))
                        {
                            cmd.Parameters.AddWithValue("?", subscription);
                            cmd.Parameters.AddWithValue("?", subscriptionId);
                            cmd.ExecuteNonQuery();
                        }
                    }
                    else
                    {
                        // Inserisce una nuova sottoscrizione
                        string insertQuery = @"INSERT INTO NotificheSubscriptions 
                                            (UtenteID, Subscription, DataCreazione, UltimoAggiornamento)
                                            VALUES (?, ?, Now(), Now())";

                        using (OleDbCommand cmd = new OleDbCommand(insertQuery, conn))
                        {
                            cmd.Parameters.AddWithValue("?", userId);
                            cmd.Parameters.AddWithValue("?", subscription);
                            cmd.ExecuteNonQuery();
                        }
                    }

                    return new { success = true };
                }
            }
            catch (Exception ex)
            {
                return new { success = false, error = ex.Message };
            }
        }

        protected void btnTornaIndietro_Click(object sender, EventArgs e)
        {
            Response.Redirect("~/benefici.aspx");
        }
    }
} 