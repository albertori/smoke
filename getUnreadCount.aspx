<%@ Page Language="C#" %>
<%@ Import Namespace="System.Data.OleDb" %>
<%@ Import Namespace="System.Web.Script.Serialization" %>
<%
    Response.ContentType = "application/json";
    Response.Cache.SetCacheability(HttpCacheability.NoCache);

    try 
    {
        string userId = Request.QueryString["userId"];
        if (string.IsNullOrEmpty(userId))
        {
            Response.Write("{\"error\": \"UserId non specificato\", \"debug\": \"userId vuoto\"}");
            return;
        }

        using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
        {
            conn.Open();
            string query = @"SELECT COUNT(*) AS UnreadCount 
                           FROM Notifiche 
                           WHERE UtenteID = ? AND Letta = False";

            using (OleDbCommand cmd = new OleDbCommand(query, conn))
            {
                cmd.Parameters.AddWithValue("?", userId);
                int unreadCount = Convert.ToInt32(cmd.ExecuteScalar());
                Response.Write("{\"count\": " + unreadCount + ", \"debug\": {\"userId\": \"" + userId + "\"}}");
            }
        }
    }
    catch (Exception ex)
    {
        Response.Write("{\"error\": \"" + ex.Message.Replace("\"", "'") + "\", \"debug\": \"eccezione nel conteggio\"}");
    }
%> 