<%@ Page Language="C#" AutoEventWireup="true" CodeFile="statistiche.aspx.cs" Inherits="NomeProgetto.statistiche" ContentType="text/html;charset=utf-8" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Statistiche Sigarette Non Fumate</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet" />
    <link href="styles/statistiche.css" rel="stylesheet" />
</head>
<body class="bg-light">
    <form id="form1" runat="server">
        <div class="container py-5">
            <div class="row mb-4">
                <div class="col-12 mb-3">
                    <h2 class="text-primary mb-2">
                        <i class="bi bi-bar-chart-line me-2"></i>
                        <asp:Label ID="lblEmail" runat="server" Text="" /> - "Non Ho Fumato"
                    </h2>
                </div>
                
                <div class="col-12 mb-4">
                    <asp:Button ID="btnTornaBenefici" runat="server" 
                               CssClass="btn btn-outline-primary me-2" 
                               Text="Indietro" 
                               OnClick="btnTornaBenefici_Click" />
                    <asp:Button ID="btnAzzeraDati" runat="server" 
                               CssClass="btn btn-outline-danger" 
                               Text="Azzera Dati" 
                               OnClientClick="return confirmDelete();"
                               OnClick="btnAzzeraDati_Click" />
                </div>

                <div class="col-12">
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle-fill me-2"></i>
                        <strong>Come funziona:</strong> Ogni volta che resisti alla tentazione di fumare, registri l'evento. 
                        Queste statistiche ti mostrano i tuoi progressi e ti aiutano a identificare i momenti più critici della giornata.
                    </div>
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
                                Sigarette Non Fumate
                                <i class="bi bi-info-circle ms-1" data-bs-toggle="tooltip" data-bs-placement="top" 
                                   title="Il numero totale di volte che hai resistito alla tentazione"></i>
                            </h6>
                            <h3 class="mb-0" id="totaleSigarette" runat="server">0</h3>
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
                                Tempo Totale di Resistenza
                                <i class="bi bi-info-circle ms-1" data-bs-toggle="tooltip" data-bs-placement="top" 
                                   title="Il tempo totale in cui hai resistito alla tentazione"></i>
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
                                Durata Media Resistenza
                                <i class="bi bi-info-circle ms-1" data-bs-toggle="tooltip" data-bs-placement="top" 
                                   title="In media, quanto tempo resisti alla tentazione"></i>
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
                                   title="Come sta andando questa settimana rispetto alla scorsa"></i>
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
                                Tempi di Resistenza
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
                                Quando Resisti di Più
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
                                Il Tuo Progresso
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

            function confirmDelete() {
                return confirm("Sei sicuro di voler eliminare tutti i tuoi dati statistici? Questa azione non può essere annullata.");
            }
        </script>
        <script src="Scripts/statistiche.js"></script>
    </form>
</body>
</html>
