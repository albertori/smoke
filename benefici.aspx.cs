using System;
using System.Configuration;
using System.Data.OleDb;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace NomeProgetto
{
    public partial class benefici : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                CaricaStatistiche();
            }
        }

        private void CaricaStatistiche()
        {
            using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
            {
                conn.Open();
                using (OleDbCommand cmd = new OleDbCommand(
                    "SELECT TOP 1 Sigarette, Risparmio, Catrame, Tempo " +
                    "FROM Progressi " +
                    "ORDER BY ID DESC", conn))
                {
                    using (OleDbDataReader reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            int sigarette = reader["Sigarette"] != DBNull.Value ? Convert.ToInt32(reader["Sigarette"]) : 0;
                            sigaretteLabel.Text = sigarette.ToString();
                            sigaretteButtonLabel.Text = sigarette.ToString();
                            
                            double risparmio = reader["Risparmio"] != DBNull.Value ? Convert.ToDouble(reader["Risparmio"]) : 0;
                            risparmioLabel.Text = risparmio.ToString("0.00");
                            
                            int catrame = reader["Catrame"] != DBNull.Value ? Convert.ToInt32(reader["Catrame"]) : 0;
                            catrameLabel.Text = catrame.ToString();
                            
                            int tempo = reader["Tempo"] != DBNull.Value ? Convert.ToInt32(reader["Tempo"]) : 0;
                            tempoLabel.Text = tempo.ToString();
                        }
                        else
                        {
                            sigaretteLabel.Text = "0";
                            sigaretteButtonLabel.Text = "0";
                            risparmioLabel.Text = "0.00";
                            catrameLabel.Text = "0";
                            tempoLabel.Text = "0";
                        }
                    }
                }
            }
        }

        protected void nonFumareBtn_Click(object sender, EventArgs e)
        {
            int sigaretteAttuali = Convert.ToInt32(sigaretteLabel.Text);
            double risparmioAttuale = Convert.ToDouble(risparmioLabel.Text);
            int catrameAttuale = Convert.ToInt32(catrameLabel.Text);
            int tempoAttuale = Convert.ToInt32(tempoLabel.Text);

            sigaretteAttuali++;
            risparmioAttuale += 0.30;
            catrameAttuale += 10;
            tempoAttuale += 5;

            using (OleDbConnection conn = new OleDbConnection(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString))
            {
                conn.Open();
                using (OleDbCommand cmd = new OleDbCommand(
                    "INSERT INTO Progressi (DataOra, Sigarette, Risparmio, Catrame, Tempo) " +
                    "VALUES (NOW(), ?, ?, ?, ?)", conn))
                {
                    cmd.Parameters.AddWithValue("@Sigarette", sigaretteAttuali);
                    cmd.Parameters.AddWithValue("@Risparmio", risparmioAttuale);
                    cmd.Parameters.AddWithValue("@Catrame", catrameAttuale);
                    cmd.Parameters.AddWithValue("@Tempo", tempoAttuale);
                    cmd.ExecuteNonQuery();
                }
            }

            sigaretteLabel.Text = sigaretteAttuali.ToString();
            sigaretteButtonLabel.Text = sigaretteAttuali.ToString();
            risparmioLabel.Text = risparmioAttuale.ToString("0.00");
            catrameLabel.Text = catrameAttuale.ToString();
            tempoLabel.Text = tempoAttuale.ToString();
        }
    }
} 