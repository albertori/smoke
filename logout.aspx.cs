using System;
using System.Web;

namespace NomeProgetto
{
    public partial class logout : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            // Rimuovi la sessione
            Session.Clear();
            Session.Abandon();

            // Rimuovi il cookie di autenticazione
            if (Request.Cookies["UserAuth"] != null)
            {
                HttpCookie authCookie = new HttpCookie("UserAuth");
                authCookie.Expires = DateTime.Now.AddDays(-1);
                Response.Cookies.Add(authCookie);
            }

            // Redirect alla pagina di login
            Response.Redirect("login.aspx");
        }
    }
} 