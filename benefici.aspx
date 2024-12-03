<%@ Page Language="C#" AutoEventWireup="true" CodeFile="benefici.aspx.cs" Inherits="NomeProgetto.benefici" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Benefici - Stop Smoking</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" />
    <link rel="stylesheet" href="Styles/benefici.css" />
</head>
<body>
    <form id="form1" runat="server">
        <div class="container py-4">
            <div class="app-container">
                <!-- Statistiche a sinistra -->
                <div class="stats-container">
                    <div class="progress-card">
                        <i class="bi bi-x-circle"></i>
                        <h3><asp:Label ID="sigaretteLabel" runat="server" Text="0" /></h3>
                        <p>Sigarette non fumate</p>
                    </div>
                    
                    <div class="progress-card">
                        <i class="bi bi-piggy-bank"></i>
                        <h3>&euro;<asp:Label ID="risparmioLabel" runat="server" Text="0.00" /></h3>
                        <p>Risparmiati</p>
                    </div>
                </div>

                <!-- Bottone centrale -->
                <div class="button-container">
                    <div id="nonFumareBtn">
                        <svg class="circular-text" viewBox="0 0 100 100">
                            <path id="curve" fill="transparent" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0"/>
                            <text>
                                <textPath href="#curve" startOffset="50%" text-anchor="middle">
                                    Non ho fumato
                                </textPath>
                            </text>
                        </svg>
                        <div class="button-content">
                            <span class="button-number">
                                <asp:Label ID="sigaretteButtonLabel" runat="server" Text="0" />
                            </span>
                        </div>
                        <asp:Button ID="clickButton" runat="server" 
                                   OnClick="nonFumareBtn_Click"
                                   Style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; opacity: 0;"
                                   Text="" />
                    </div>
                </div>

                <!-- Statistiche a destra -->
                <div class="stats-container">
                    <div class="progress-card">
                        <i class="bi bi-droplet"></i>
                        <h3><asp:Label ID="catrameLabel" runat="server" Text="0" />mg</h3>
                        <p>Catrame evitato</p>
                    </div>
                    
                    <div class="progress-card">
                        <i class="bi bi-clock"></i>
                        <h3><asp:Label ID="tempoLabel" runat="server" Text="0" />min</h3>
                        <p>Tempo risparmiato</p>
                    </div>
                </div>
            </div>
        </div>
    </form>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="Scripts/benefici.js"></script>
</body>
</html> 