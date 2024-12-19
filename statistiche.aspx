<%@ Page Language="C#" AutoEventWireup="true" CodeFile="statistiche.aspx.cs" Inherits="NomeProgetto.statistiche" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Statistiche</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet" />
    <link href="styles/statistiche.css" rel="stylesheet" />
</head>
<body class="bg-light">
    <form id="form1" runat="server">
        <div class="container py-5">
            <div class="row mb-4">
                <div class="col-12">
                    <h2 class="text-primary mb-0">
                        <i class="bi bi-bar-chart-line me-2"></i>
                        Dashboard Statistiche
                    </h2>
                    <p class="text-muted">Monitora il tuo progresso nel percorso di cessazione</p>
                </div>
            </div>

            <!-- Riepilogo Generale -->
            <div class="row g-4 mb-4">
                <div class="col-12 col-sm-6">
                    <div class="stat-summary-card">
                        <div class="icon-wrapper bg-primary">
                            <i class="bi bi-check2-circle"></i>
                        </div>
                        <div class="content">
                            <h6 class="text-muted mb-1">
                                Voglie Gestite
                                <i class="bi bi-info-circle ms-1" data-bs-toggle="tooltip" data-bs-placement="top" 
                                   title="Numero totale di momenti di desiderio che hai gestito con successo"></i>
                            </h6>
                            <h3 class="mb-0" id="totaleTentativi" runat="server">0</h3>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-sm-6">
                    <div class="stat-summary-card">
                        <div class="icon-wrapper bg-success">
                            <i class="bi bi-clock"></i>
                        </div>
                        <div class="content">
                            <h6 class="text-muted mb-1">
                                Tempo Totale
                                <i class="bi bi-info-circle ms-1" data-bs-toggle="tooltip" data-bs-placement="top" 
                                   title="Tempo totale accumulato nella gestione delle voglie"></i>
                            </h6>
                            <h3 class="mb-0" id="tempoTotale" runat="server">00:00:00</h3>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-sm-6">
                    <div class="stat-summary-card">
                        <div class="icon-wrapper bg-info">
                            <i class="bi bi-stopwatch"></i>
                        </div>
                        <div class="content">
                            <h6 class="text-muted mb-1">
                                Tempo Medio
                                <i class="bi bi-info-circle ms-1" data-bs-toggle="tooltip" data-bs-placement="top" 
                                   title="Durata media di ogni momento di desiderio"></i>
                            </h6>
                            <h3 class="mb-0" id="tempoMedio" runat="server">00:00:00</h3>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-sm-6">
                    <div class="stat-summary-card">
                        <div class="icon-wrapper bg-warning">
                            <i class="bi bi-graph-up-arrow"></i>
                        </div>
                        <div class="content">
                            <h6 class="text-muted mb-1">
                                Variazione Settimanale
                                <i class="bi bi-info-circle ms-1" data-bs-toggle="tooltip" data-bs-placement="top" 
                                   title="Variazione percentuale rispetto alla settimana precedente"></i>
                            </h6>
                            <h3 class="mb-0" id="variazioneSettimanale" runat="server">0%</h3>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dettagli e Analisi -->
            <div class="row g-4">
                <!-- Dettagli Tempi -->
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-white">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-clock-history me-2"></i>
                                Dettagli Tempi
                                <i class="bi bi-info-circle ms-1" data-bs-toggle="tooltip" data-bs-placement="top" 
                                   title="Analisi dettagliata dei tempi minimi e massimi di gestione"></i>
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="row g-3">
                                <div class="col-12 col-sm-6">
                                    <div class="detail-item">
                                        <label class="text-muted">Tempo Minimo</label>
                                        <h4 id="tempoMinimo" runat="server">00:00:00</h4>
                                    </div>
                                </div>
                                <div class="col-12 col-sm-6">
                                    <div class="detail-item">
                                        <label class="text-muted">Tempo Massimo</label>
                                        <h4 id="tempoMassimo" runat="server">00:00:00</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Analisi Temporale -->
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-white">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-calendar-check me-2"></i>
                                Analisi Temporale
                                <i class="bi bi-info-circle ms-1" data-bs-toggle="tooltip" data-bs-placement="top" 
                                   title="Identificazione dei momenti più critici della giornata e della settimana"></i>
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="row g-3">
                                <div class="col-12 col-sm-6">
                                    <div class="detail-item">
                                        <label class="text-muted">Ora Critica</label>
                                        <h4 id="oraCritica" runat="server">--:--</h4>
                                    </div>
                                </div>
                                <div class="col-12 col-sm-6">
                                    <div class="detail-item">
                                        <label class="text-muted">Giorno Critico</label>
                                        <h4 id="giornoCritico" runat="server">---</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Confronto Settimanale -->
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-white">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-bar-chart me-2"></i>
                                Confronto Settimanale
                                <i class="bi bi-info-circle ms-1" data-bs-toggle="tooltip" data-bs-placement="top" 
                                   title="Confronto tra il numero di voglie gestite questa settimana e la settimana scorsa"></i>
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="row g-3">
                                <div class="col-12 col-sm-6">
                                    <div class="comparison-item">
                                        <label class="text-muted">Settimana Corrente</label>
                                        <h3 class="text-primary" id="tentativiSettimanaCorrente" runat="server">0</h3>
                                    </div>
                                </div>
                                <div class="col-12 col-sm-6">
                                    <div class="comparison-item">
                                        <label class="text-muted">Settimana Scorsa</label>
                                        <h3 class="text-secondary" id="tentativiSettimanaScorsa" runat="server">0</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
                var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
                    return new bootstrap.Tooltip(tooltipTriggerEl);
                });
            });
        </script>
    </form>
</body>
</html>
