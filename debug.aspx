<%@ Page Language="C#" AutoEventWireup="true" %>
<%@ Import Namespace="System.IO" %>

<script runat="server">
    protected void Page_Load(object sender, EventArgs e)
    {
        string logPath = Server.MapPath("~/App_Data/debug.txt");
        string errorPath = Server.MapPath("~/App_Data/error.txt");
        string writeErrorPath = Server.MapPath("~/App_Data/write_error.txt");

        Response.Write("<h2>Log principali</h2>");
        ShowLog(logPath);

        Response.Write("<h2>Log errori</h2>");
        ShowLog(errorPath);

        Response.Write("<h2>Errori di scrittura</h2>");
        ShowLog(writeErrorPath);
    }

    private void ShowLog(string path)
    {
        if (File.Exists(path))
        {
            Response.Write("<pre>");
            Response.Write(Server.HtmlEncode(File.ReadAllText(path)));
            Response.Write("</pre>");
        }
        else
        {
            Response.Write("<p>Nessun log trovato in: " + Path.GetFileName(path) + "</p>");
        }
    }
</script>

<!DOCTYPE html>
<html>
<head>
    <title>Debug Log</title>
    <style>
        pre { 
            background-color: #f5f5f5; 
            padding: 10px; 
            border: 1px solid #ddd; 
        }
        h2 { margin-top: 20px; }
    </style>
</head>
<body>
    <h1>Debug Log</h1>
</body>
</html> 