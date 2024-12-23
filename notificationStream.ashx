<%@ WebHandler Language="C#" Class="NotificationHandler" %>
using System;
using System.Web;
using System.Data.OleDb;
using System.Web.Script.Serialization;

public class NotificationHandler : IHttpHandler 
{
    public void ProcessRequest(HttpContext context) 
    {
        context.Response.ContentType = "application/json";
        context.Response.Cache.SetCacheability(HttpCacheability.NoCache);
        
        var debug = new System.Collections.Generic.Dictionary<string, string>();
        var serializer = new JavaScriptSerializer();
        
        try 
        {
            string userId = context.Session["UtenteID"]?.ToString();
            debug.Add("sessionUserId", userId ?? "null");

            if (string.IsNullOrEmpty(userId))
            {
                HttpCookie userCookie = context.Request.Cookies["UserId"];
                if (userCookie != null)
                {
                    userId = userCookie.Value;
                    debug.Add("cookieUserId", userId);
                }
            }

            if (string.IsNullOrEmpty(userId))
            {
                context.Response.Write(serializer.Serialize(new { 
                    error = "UserId non trovato", 
                    debug = debug 
                }));
                return;
            }

            debug.Add("finalUserId", userId);

            using (OleDbConnection conn = new OleDbConnection(System.Configuration.ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
            {
                conn.Open();
                
                string query = "SELECT COUNT(*) FROM Notifiche WHERE UtenteID = ? AND Letta = False";

                using (OleDbCommand cmd = new OleDbCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("?", userId);
                    int unreadCount = Convert.ToInt32(cmd.ExecuteScalar());
                    debug.Add("unreadCount", unreadCount.ToString());
                    
                    context.Response.Write(serializer.Serialize(new { 
                        count = unreadCount, 
                        debug = debug 
                    }));
                }
            }
        }
        catch (Exception ex)
        {
            context.Response.Write(serializer.Serialize(new { 
                error = ex.Message, 
                debug = debug,
                stack = ex.StackTrace
            }));
        }
    }
 
    public bool IsReusable 
    {
        get { return false; }
    }
}