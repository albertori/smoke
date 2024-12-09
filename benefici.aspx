<%@ Page Language="C#" AutoEventWireup="true" CodeFile="benefici.aspx.cs" Inherits="NomeProgetto.benefici" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Meta tag PWA -->
    <link rel="manifest" href="manifest.json">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="application-name" content="Non Ho Fumato">
    <meta name="apple-mobile-web-app-title" content="Non Ho Fumato">
    <meta name="theme-color" content="#4CAF50">
    <meta name="msapplication-navbutton-color" content="#4CAF50">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="msapplication-starturl" content="/benefici.aspx">
    
    <!-- Apple Touch Icons -->
    <link rel="apple-touch-icon" sizes="57x57" href="images/icon-57x57.png">
    <link rel="apple-touch-icon" sizes="72x72" href="images/icon-72x72.png">
    <link rel="apple-touch-icon" sizes="114x114" href="images/icon-114x114.png">
    <link rel="apple-touch-icon" sizes="144x144" href="images/icon-144x144.png">
    <link rel="apple-touch-icon" sizes="152x152" href="images/icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="images/icon-180x180.png">
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" sizes="32x32" href="images/icon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="images/icon-16x16.png">
    
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
                        <h3 id="sigaretteTitle">
                            <i class="fas fa-smoking-ban"></i>
                            Sigarette non fumate
                        </h3>
                        <div class="value" id="sigaretteLabel">0</div>
                        <div class="label" id="sigaretteLabel">Totale</div>
                    </div>
                    
                    <div class="progress-card">
                        <h3 id="risparmioTitle">
                            <i class="fas fa-euro-sign"></i>
                            Risparmio
                        </h3>
                        <div class="value" id="risparmioValue">0.00</div>
                        <div class="label" id="risparmioLabel">Euro risparmiati</div>
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

            <!-- Aggiungi questo dopo il div daily-progress-container -->
            <div class="settings-panel" id="settingsPanel">
                <button class="settings-toggle" id="settingsToggle" type="button">
                    <i class="fas fa-cog"></i>
                </button>
                
                <div class="settings-content">
                    <h3 id="settingsTitle">Personalizza</h3>
                    
                    <!-- Aggiungiamo lo switch qui -->
                    <div class="switch-container">
                        <label class="switch">
                            <input type="checkbox" id="smokeSwitch">
                            <span class="slider"></span>
                        </label>
                        <span id="switchLabel">Modalità sigarette non fumate</span>
                    </div>
                    
                    <div class="language-selector">
                        <label id="languageLabel">Lingua</label>
                        <select id="languageSelect">
                            <option value="it">Italiano</option>
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                        </select>
                    </div>

                    <div class="color-picker-group">
                        <label id="primaryColorLabel">Colore Principale</label>
                        <input type="color" id="primaryColorPicker" value="#4A90E2">
                    </div>
                    
                    <div class="color-picker-group">
                        <label id="bgColorLabel">Colore Sfondo</label>
                        <input type="color" id="bgColorPicker" value="#D1E3F9">
                    </div>
                    
                    <div class="color-picker-group">
                        <label id="textColorLabel">Colore Testo</label>
                        <input type="color" id="textColorPicker" value="#2C3E50">
                    </div>

                    <button class="reset-button" id="resetColors">
                        Ripristina Colori
                    </button>
                </div>
            </div>

            <!-- Aggiungi questo dove preferisci nella pagina, magari in alto a destra -->
            <div class="logout-container" style="position: absolute; top: 10px; right: 10px;">
                <a href="logout.aspx" class="btn btn-outline-danger btn-sm">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            </div>
        </div>
    </form>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="Scripts/benefici.js"></script>
    <script src="Scripts/translations.js"></script>
    <script src="Scripts/switchMode.js"></script>
</body>
</html> 