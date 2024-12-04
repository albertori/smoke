<%@ Page Language="C#" AutoEventWireup="true" CodeFile="benefici.aspx.cs" Inherits="NomeProgetto.benefici" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Benefici - Stop Smoking</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="stylesheet" href="Styles/benefici.css" />
</head>
<body>
    <form id="form1" runat="server">
        <div class="container py-4">
            <div class="app-container d-flex justify-content-between align-items-center">
                <!-- Statistiche a sinistra -->
                <div class="stats-container">
                    <div class="progress-card">
                        <h3>
                            <i class="fas fa-smoking-ban"></i>
                            Sigarette non fumate
                        </h3>
                        <div class="value" id="sigaretteLabel">0</div>
                        <div class="label">Totale</div>
                    </div>
                    
                    <div class="progress-card">
                        <h3>
                            <i class="fas fa-euro-sign"></i>
                            Risparmio
                        </h3>
                        <div class="value" id="risparmioLabel">0.00</div>
                        <div class="label">Euro risparmiati</div>
                    </div>
                </div>

                <!-- Bottone centrale -->
                <div class="button-container">
                    <div id="nonFumareBtn">
                        <svg class="circular-text" viewBox="0 0 100 100">
                            <defs>
                                <path id="curve" fill="transparent" 
                                      d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"/>
                            </defs>
                            <text>
                                <textPath href="#curve" startOffset="50%" text-anchor="middle">
                                    Non ho fumato
                                </textPath>
                            </text>
                        </svg>
                        <div class="button-content">
                            <span class="button-number" id="sigaretteButtonLabel">0</span>
                        </div>
                        <button id="clickButton" type="button"></button>
                    </div>
                </div>

                <!-- Statistiche a destra -->
                <div class="stats-container">
                    <div class="progress-card">
                        <h3>
                            <i class="fas fa-lungs"></i>
                            Catrame evitato
                        </h3>
                        <div class="value" id="catrameLabel">0</div>
                        <div class="label">mg non inalati</div>
                    </div>

                    <div class="progress-card">
                        <h3>
                            <i class="fas fa-clock"></i>
                            Tempo recuperato
                        </h3>
                        <div class="value" id="tempoLabel">0</div>
                        <div class="label">minuti guadagnati</div>
                    </div>
                </div>
            </div>

            <!-- Progress bar giornaliera -->
            <div class="daily-progress-container">
                <div class="daily-progress">
                    <div class="progress-bar" id="dailyProgressBar"></div>
                </div>
                <div class="time-markers">
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>24:00</span>
                </div>
            </div>
        </div>
    </form>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="Scripts/benefici.js"></script>
</body>
</html> 