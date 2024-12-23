<%@ Control Language="C#" %>

<nav class="navbar navbar-expand-lg navbar-dark fixed-top">
    <div class="container-fluid">
        <a class="navbar-brand" href="default.aspx">
            <img src="images/icon-96x96.png" alt="Logo" width="30" height="30" class="d-inline-block align-text-top me-2">
            Non Ho Fumato
        </a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
                <li class="nav-item">
                    <span class="nav-link" id="statisticheLink" role="button">
                        <i class="fas fa-chart-bar"></i>
                        <span>Statistiche</span>
                    </span>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" id="settingsToggle">
                        <i class="fas fa-cog"></i>
                        <span>Impostazioni</span>
                    </a>
                </li>
                <li class="nav-item">
                    <span class="nav-link">
                        <i class="fas fa-user"></i>
                        <span id="userEmail" runat="server"></span>
                    </span>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="logout.aspx">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</nav> 