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
    <link rel="stylesheet" href="Styles/benefici.css?v=1.1" />
    <link rel="stylesheet" href="Styles/timeTracking.css?v=1.1" />
</head>
<body>
    <form id="form1" runat="server">
        <div class="container py-4">
            <div class="top-menu">
                <div class="menu-items">
                    <div class="menu-item">
                        <i class="fas fa-user"></i>
                        <span id="userEmail" runat="server"></span>
                    </div>
                    <a href="#" class="menu-item" id="statisticheLink">
                        <i class="fas fa-chart-bar"></i> Statistiche
                    </a>
                    <a href="#" class="menu-item" id="settingsToggle">
                        <i class="fas fa-cog"></i> Impostazioni
                    </a>
                    <a href="logout.aspx" class="menu-item">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
            </div>
            <div class="app-container d-flex justify-content-between align-items-center">
                <!-- Statistiche a sinistra -->
                <div class="stats-container">
                    <div class="progress-card">
                        <h3 id="sigaretteTitle">
                            <i class="fas fa-smoking-ban"></i>
                        </h3>
                        <div class="value" id="sigaretteLabel">242</div>
                        <div class="label" id="sigaretteLabel">Totale</div>
                    </div>
                    
                    <div class="progress-card">
                        <h3 id="risparmioTitle">
                            <i class="fas fa-euro-sign"></i>
                        </h3>
                        <div class="value" id="risparmioValue">72.60</div>
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
                                    Non Ho Fumato
                                </textPath>
                            </text>
                        </svg>
                        <div class="button-content">
                            <span class="button-number green" id="sigaretteButtonLabel">203</span>
                        </div>
                        <button id="clickButton" type="button"></button>
                    </div>
                </div>

                <!-- Statistiche a destra -->
                <div class="stats-container">
                    <div class="progress-card">
                        <h3>
                            <i class="fas fa-lungs"></i>
                        </h3>
                        <div class="value" id="catrameLabel">2420</div>
                        <div class="label">mg non inalati</div>
                    </div>

                    <div class="progress-card">
                        <h3>
                            <i class="fas fa-clock"></i>
                        </h3>
                        <div class="value" id="tempoLabel">1210</div>
                        <div class="label">minuti guadagnati</div>
                    </div>
                </div>
            </div>

            <!-- Spostiamo questo dopo app-container e prima di daily-progress-container -->
            <div class="container">
                <!-- Timer container -->
                <div class="timer-tracking-container">
                    <!-- Prima barra -->
                    <div class="timer-section">
                        <div class="timer-display">
                            <span id="currentTimeLabel" class="time-label">00:00:00</span>
                        </div>
                        <div class="timer-progress-wrapper">
                            <div class="timer-progress-container">
                                <div id="lastTimeBar" class="timer-progress" style="width: 0%;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Seconda barra (identica) -->
                    <div class="timer-section">
                        <div class="timer-display">
                            <span id="secondTimeLabel" class="time-label">00:00:00</span>
                        </div>
                        <div class="timer-progress-wrapper">
                            <div class="timer-progress-container">
                                <div id="secondTimeBar" class="timer-progress" style="width: 0%;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Controlli centralizzati -->
                    <div class="timer-controls">
                        <button id="resetBestTime" class="timer-button">Inizia</button>
                    </div>
                </div>

                <!-- Manteniamo questa parte per benefici.js -->
                <div class="daily-progress">
                    <div class="progress-bar" id="dailyProgressBar" style="width: 0%;"></div>
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

            <!-- Aggiungi questo subito dopo il div settings-panel -->
            <div class="settings-overlay"></div>
        </div>
    </form>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="Scripts/logger.js"></script>
    <script src="Scripts/benefici.js"></script>
    <script src="Scripts/translations.js"></script>
    <script src="Scripts/switchMode.js"></script>
        <script src="Scripts/timeTracker.js"></script>
    
</body>
</html> 