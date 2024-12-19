using System;
using System.Web.Services;
using System.Web.Script.Services;

namespace NomeProgetto
{
    public partial class nonStatistiche : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            // Verifica autenticazione come in statistiche.aspx
            if (!IsPostBack)
            {
                if (Session["Email"] != null)
                {
                    userEmail.InnerText = Session["Email"].ToString();
                }
                else
                {
                    Response.Redirect("login.aspx");
                }
            }
        }

        // Metodi WebMethod specifici per le statistiche della modalità "Ho Fumato"
        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public static object GetStatisticheFumate()
        {
            // Implementa la logica per recuperare le statistiche
            // specifiche per la modalità "Ho Fumato"
            return new { /* dati statistiche */ };
        }
    }
} 