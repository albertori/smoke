<%@ Page Title="Home" Language="C#" MasterPageFile="Site.Master" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>
<%@ OutputCache Location="None" NoStore="true" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <!-- Anti-caching headers -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    
    <meta charset="utf-8">
    <link rel="stylesheet" href="styles/stile.css">
    <!-- Dependencies -->
    <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
    <!-- Bootstrap Icons - Versione più recente -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <!-- Header con carousel di immagini -->
    <div id="carouselExampleFade" class="carousel slide carousel-fade" data-bs-ride="carousel">
        <div class="carousel-inner">
            <div class="carousel-item active">
                <img src="/nuovo_nsa/img/ecig.jpg" class="d-block w-100" alt="Sigaretta elettronica 1">
                <div class="carousel-caption">
                    <h2 class="display-4">NoSmokingArea</h2>
                    <p>Scopri un mondo di alternative al fumo tradizionale</p>
                </div>
            </div>
            <div class="carousel-item">
                <img src="/nuovo_nsa/img/ecig1.jpg" class="d-block w-100" alt="Sigaretta elettronica 2">
                <div class="carousel-caption">
                    <h2 class="display-4">NoSmokingArea</h2>
                    <p>Scopri un mondo di alternative al fumo tradizionale</p>
                </div>
            </div>
            <div class="carousel-item">
                <img src="/nuovo_nsa/img/ecig2.jpg" class="d-block w-100" alt="Sigaretta elettronica 3">
                <div class="carousel-caption">
                    <h2 class="display-4">NoSmokingArea</h2>
                    <p>Scopri un mondo di alternative al fumo tradizionale</p>
                </div>
            </div>
            <div class="carousel-item">
                <img src="/nuovo_nsa/img/ecig3.jpg" class="d-block w-100" alt="Sigaretta elettronica 4">
                <div class="carousel-caption">
                    <h2 class="display-4">NoSmokingArea</h2>
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
                    <h2 class="h4 mb-4 text-primary">Il primo negozio di sigarette elettroniche a Roma</h2>
                    <p class="lead mb-0">
                        Benvenuti nel nostro negozio di sigarette elettroniche a Roma, situato in Piazza Carnaro, nel cuore di Montesacro, 
                        vicino ai quartieri Talenti, Nuovo Salario e Nomentana. Offriamo un'ampia selezione di sigarette elettroniche multimarca, 
                        liquidi di alta qualit&agrave; e accessori per lo svapo. Da noi troverai tutto ci&ograve; che ti serve per un'esperienza di svapo 
                        unica e personalizzata. Ti aspettiamo per consigliarti al meglio!
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Root element per React -->
    <div id="root"></div>

    <!-- Script React -->
    <script type="text/babel" src="App.js"></script>

    <!-- Nuova sezione con contenuti dettagliati -->
    <div class="container my-5">
        <div class="row justify-content-center">
            <div class="col-12 col-md-10">
                <div class="content-sections">
                    <div class="content-section mb-5">
                        <h2 class="h4 mb-3">Esperti in Sigarette Elettroniche a Roma</h2>
                        <p>Dal 2011, NoSmokingArea &egrave; il punto di riferimento per gli appassionati di svapo a Roma. Il nostro team di esperti &egrave; costantemente aggiornato sulle ultime novit&agrave; del settore per offrirti consulenza professionale e prodotti di alta qualit&agrave;.</p>
                        <p>Che tu sia un principiante o un esperto dello svapo, troverai da noi:</p>
                        <div class="features-list p-4 bg-light rounded shadow-sm border border-2 border-success border-opacity-25">
                            <ul class="list-unstyled mb-0">
                                <li class="mb-3 d-flex align-items-center feature-item">
                                    <div class="feature-icon bg-success bg-opacity-10 rounded-circle p-2 me-3">
                                        <i class="bi bi-check-circle-fill text-success fs-5"></i>
                                    </div>
                                    <div class="feature-text">
                                        <h4 class="h6 mb-1">Consulenza Personalizzata</h4>
                                        <p class="mb-0 text-muted small">Per la scelta del dispositivo pi&ugrave; adatto</p>
                                    </div>
                                </li>
                                <li class="mb-3 d-flex align-items-center feature-item">
                                    <div class="feature-icon bg-success bg-opacity-10 rounded-circle p-2 me-3">
                                        <i class="bi bi-droplet-fill text-success fs-5"></i>
                                    </div>
                                    <div class="feature-text">
                                        <h4 class="h6 mb-1">Vasta Gamma di Prodotti</h4>
                                        <p class="mb-0 text-muted small">Liquidi pronti e aromi concentrati</p>
                                    </div>
                                </li>
                                <li class="mb-3 d-flex align-items-center feature-item">
                                    <div class="feature-icon bg-success bg-opacity-10 rounded-circle p-2 me-3">
                                        <i class="bi bi-tools text-success fs-5"></i>
                                    </div>
                                    <div class="feature-text">
                                        <h4 class="h6 mb-1">Assistenza Tecnica</h4>
                                        <p class="mb-0 text-muted small">Supporto post-vendita garantito</p>
                                    </div>
                                </li>
                                <li class="d-flex align-items-center feature-item">
                                    <div class="feature-icon bg-success bg-opacity-10 rounded-circle p-2 me-3">
                                        <i class="bi bi-shield-check text-success fs-5"></i>
                                    </div>
                                    <div class="feature-text">
                                        <h4 class="h6 mb-1">Prodotti Certificati</h4>
                                        <p class="mb-0 text-muted small">Qualit&agrave; e sicurezza garantite</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="content-section mb-5">
                        <h2 class="h4 mb-4 text-center">I Nostri Servizi</h2>
                        <div class="services-section">
                            <div class="row g-4">
                                <div class="col-md-6">
                                    <div class="service-card">
                                        <div class="service-icon">
                                            <i class="bi bi-person-check"></i>
                                        </div>
                                        <h3 class="service-title">Consulenza Personalizzata</h3>
                                        <p class="service-description">
                                            Il nostro staff qualificato ti guider&agrave; nella scelta della sigaretta elettronica pi&ugrave; adatta 
                                            alle tue esigenze, considerando il tuo stile di svapo e le tue preferenze personali.
                                        </p>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="service-card">
                                        <div class="service-icon">
                                            <i class="bi bi-tools"></i>
                                        </div>
                                        <h3 class="service-title">Assistenza Tecnica</h3>
                                        <p class="service-description">
                                            Offriamo un servizio completo di assistenza tecnica per tutti i dispositivi acquistati 
                                            nel nostro negozio, garantendo supporto continuo per qualsiasi necessit&agrave;.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="content-section mb-5">
                        <h2 class="h4 mb-3">Perch&eacute; Scegliere NoSmokingArea</h2>
                        <div class="row g-4">
                            <div class="col-md-4">
                                <h3 class="h5">Qualit&agrave; Garantita</h3>
                                <p>Vendiamo esclusivamente prodotti originali delle migliori marche del settore, garantendo sicurezza e affidabilit&agrave;.</p>
                            </div>
                            <div class="col-md-4">
                                <h3 class="h5">Esperienza Pluriennale</h3>
                                <p>Con oltre 13 anni di esperienza nel settore, siamo in grado di offrirti consulenza esperta e soluzioni personalizzate.</p>
                            </div>
                            <div class="col-md-4">
                                <h3 class="h5">Posizione Strategica</h3>
                                <p>Facilmente raggiungibile nel cuore di Montesacro, con ampia disponibilit&agrave; di parcheggio nelle vicinanze.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bottone per il calcolatore avanzato -->
    <div class="text-center mt-4">
        <button type="button" class="btn btn-primary btn-lg advanced-calc-btn" data-bs-toggle="modal" data-bs-target="#advancedCalculator">
            <i class="bi bi-calculator-fill me-2"></i>Calcolatore Avanzato
        </button>
    </div>

    <!-- Modal per il calcolatore avanzato -->
    <div class="modal fade" id="advancedCalculator" tabindex="-1" aria-labelledby="advancedCalculatorLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="advancedCalculatorLabel">Calcolatore Avanzato Diluizione Nicotina</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="calculator-advanced p-3">
                        <div class="row g-3">
                            <!-- Quantità finale desiderata -->
                            <div class="col-md-6">
                                <label for="finalAmount" class="form-label">Quantit&agrave; Finale (ml)</label>
                                <input type="number" class="form-control" id="finalAmount" min="0">
                            </div>
                            <!-- Nicotina finale desiderata -->
                            <div class="col-md-6">
                                <label for="targetStrength" class="form-label">Nicotina Finale (mg)</label>
                                <input type="number" class="form-control" id="targetStrength" min="0">
                            </div>
                            
                            <!-- Sezione basi di nicotina disponibili -->
                            <div class="col-12">
                                <h6 class="mb-3">Basi di Nicotina Disponibili</h6>
                                <div id="nicotineBases" class="mb-3">
                                    <div class="row g-2 mb-2 nicotine-base-row">
                                        <div class="col-md-5">
                                            <input type="number" class="form-control base-strength" placeholder="Concentrazione (mg)">
                                        </div>
                                        <div class="col-md-5">
                                            <select class="form-select base-type">
                                                <option value="pg">Base PG</option>
                                                <option value="vg">Base VG</option>
                                            </select>
                                        </div>
                                        <div class="col-md-2">
                                            <button type="button" class="btn btn-danger btn-sm w-100 remove-base"><i class="bi bi-trash"></i></button>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-success btn-sm" id="addBase">
                                    <i class="bi bi-plus-circle me-1"></i>Aggiungi Base
                                </button>
                            </div>
                            
                            <!-- Risultato -->
                            <div class="col-12">
                                <div class="result-section mt-4 p-3 bg-light rounded">
                                    <h6 class="mb-3">Risultato:</h6>
                                    <div id="calculationResult">
                                        <!-- I risultati verranno inseriti qui via JavaScript -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
                    <button type="button" class="btn btn-primary" id="calculateAdvanced">Calcola</button>
                </div>
            </div>
        </div>
    </div>
</asp:Content>