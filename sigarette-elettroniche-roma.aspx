<%@ Page Title="Home" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <!-- Dependencies -->
    <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <!-- Header con carousel di immagini -->
    <div id="carouselExampleFade" class="carousel slide carousel-fade" data-bs-ride="carousel">
        <div class="carousel-inner">
            <div class="carousel-item active">
                <img src="/img/ecig.jpg" class="d-block w-100" alt="Sigaretta elettronica 1">
                <div class="carousel-caption">
                    <h1 class="h2">NoSmokingArea</h1>
                    <p>Scopri un mondo di alternative al fumo tradizionale</p>
                </div>
            </div>
            <div class="carousel-item">
                <img src="/img/ecig1.jpg" class="d-block w-100" alt="Sigaretta elettronica 2">
                <div class="carousel-caption">
                    <h1>NoSmokingArea</h1>
                    <p>Scopri un mondo di alternative al fumo tradizionale</p>
                </div>
            </div>
            <div class="carousel-item">
                <img src="/img/ecig2.jpg" class="d-block w-100" alt="Sigaretta elettronica 3">
                <div class="carousel-caption">
                    <h1>NoSmokingArea</h1>
                    <p>Scopri un mondo di alternative al fumo tradizionale</p>
                </div>
            </div>
            <div class="carousel-item">
                <img src="/img/ecig3.jpg" class="d-block w-100" alt="Sigaretta elettronica 4">
                <div class="carousel-caption">
                    <h1>NoSmokingArea</h1>
                    <p>Scopri un mondo di alternative al fumo tradizionale</p>
                </div>
            </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleFade" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleFade" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
        </button>
    </div>

    <!-- Sezione di benvenuto -->
    <div class="container my-5">
        <div class="row justify-content-center">
            <div class="col-12 col-md-10">
                <div class="welcome-section p-4 bg-white rounded shadow-sm">
                    <h2 class="h4 mb-4 text-primary">Il tuo negozio di sigarette elettroniche a Roma</h2>
                    <p class="lead mb-0">
                        Benvenuti nel nostro negozio di sigarette elettroniche a Roma, situato in Piazza Carnaro, nel cuore di Montesacro, 
                        vicino ai quartieri Talenti, Nuovo Salario e Nomentana. Offriamo un'ampia selezione di sigarette elettroniche multimarca, 
                        liquidi di alta qualità e accessori per lo svapo. Da noi troverai tutto ciò che ti serve per un'esperienza di svapo 
                        unica e personalizzata. Ti aspettiamo per consigliarti al meglio!
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Root element per React -->
    <div id="root"></div>

    <!-- Script React - percorso aggiornato -->
    <script type="text/babel" src="App.js"></script>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="ScriptsPlaceHolder" runat="server">
    <!-- Bootstrap Bundle con Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</asp:Content>