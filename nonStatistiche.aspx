<%@ Page Language="C#" AutoEventWireup="true" CodeFile="nonStatistiche.aspx.cs" Inherits="NomeProgetto.nonStatistiche" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Statistiche Sigarette Fumate</title>
    <!-- Stessi riferimenti CSS/JS di statistiche.aspx -->
</head>
<body>
    <form id="form1" runat="server">
        <div class="container py-4">
            <div class="top-menu">
                <!-- Menu di navigazione -->
                <div class="menu-items">
                    <a href="benefici.aspx" class="menu-item">
                        <i class="fas fa-home"></i> Home
                    </a>
                    <div class="menu-item">
                        <i class="fas fa-user"></i>
                        <span id="userEmail" runat="server"></span>
                    </div>
                    <a href="logout.aspx" class="menu-item">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
            </div>

            <!-- Contenuto specifico per le statistiche della modalità "Ho Fumato" -->
            <div class="statistics-container">
                <!-- Qui inseriremo i grafici e le statistiche specifiche -->
            </div>
        </div>
    </form>
</body>
</html> 