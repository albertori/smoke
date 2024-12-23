using System;
using System.Web;
using System.Web.Services;
using System.Web.Script.Services;
using System.Data.OleDb;
using System.Configuration;

public partial class NotificationStream : System.Web.UI.Page
{
    [WebMethod(EnableSession = true)]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public static object GetNotificationCount()
    {
        try 
        {
            string userId = null;
            
            // Prima prova dalla sessione
            if (HttpContext.Current.Session != null && HttpContext.Current.Session["UtenteID"] != null)
            {
                userId = HttpContext.Current.Session["UtenteID"].ToString();
            }
            
            // Se non c'è nella sessione, prova dal cookie
            if (string.IsNullOrEmpty(userId))
            {
                HttpCookie userCookie = HttpContext.Current.Request.Cookies["UserId"];
                if (userCookie != null)
                {
                    userId = userCookie.Value;
                }
            }

            if (string.IsNullOrEmpty(userId))
            {
                return new { error = "Utente non autenticato", count = 0, userId = "null" };
            }

            int unreadCount = 0;
            using (var conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
            {
                conn.Open();
                using (var cmd = new OleDbCommand("SELECT COUNT(*) FROM Notifiche WHERE UtenteID = ? AND Letta = False", conn))
                {
                    cmd.Parameters.AddWithValue("?", userId);
                    unreadCount = Convert.ToInt32(cmd.ExecuteScalar());
                }
            }
            
            return new { count = unreadCount, userId = userId };
        }
        catch (Exception ex)
        {
            return new { error = ex.Message, count = 0, userId = "null" };
        }
    }
} 