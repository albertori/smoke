<%@ Page Language="C#" AutoEventWireup="true" CodeFile="notifications.aspx.cs" Inherits="NomeProgetto.notifications" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Gestione Notifiche - NoSmokingArea</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet" />
</head>
<body class="bg-light">
    <form id="form1" runat="server">
        <asp:HiddenField ID="hdnUserId" runat="server" />
        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-12 col-md-8 col-lg-6">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h2 class="card-title mb-4">
                                <i class="bi bi-bell me-2"></i>
                                Notifiche
                            </h2>
                            
                            <div id="notSupportedAlert" class="alert alert-warning d-none">
                                <i class="bi bi-exclamation-triangle me-2"></i>
                                Il tuo browser non supporta le notifiche.
                            </div>

                            <div id="subscriptionContainer">
                                <p class="mb-4">
                                    Attiva le notifiche per ricevere incoraggiamenti e promemoria 
                                    nei momenti più importanti del tuo percorso.
                                </p>

                                <button type="button" id="btnEnableNotifications" class="btn btn-primary w-100">
                                    <i class="bi bi-bell me-2"></i>
                                    Attiva Notifiche
                                </button>
                            </div>

                            <div class="mt-4">
                                <small class="text-muted">
                                    <i class="bi bi-info-circle me-1"></i>
                                    Puoi disattivare le notifiche dalle impostazioni del browser in qualsiasi momento.
                                </small>
                            </div>
                        </div>
                    </div>

                    <div class="text-center mt-4">
                        <asp:Button ID="btnTornaIndietro" runat="server" 
                                  CssClass="btn btn-outline-primary" 
                                  Text="Torna Indietro" 
                                  OnClick="btnTornaIndietro_Click" />
                    </div>
                </div>
            </div>
        </div>
    </form>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="Scripts/notifications.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', async function () {
            const btnEnable = document.getElementById('btnEnableNotifications');
            const notSupportedAlert = document.getElementById('notSupportedAlert');

            if (!('Notification' in window)) {
                notSupportedAlert.classList.remove('d-none');
                btnEnable.disabled = true;
                return;
            }

            if (Notification.permission === 'granted') {
                btnEnable.textContent = 'Notifiche Attive';
                btnEnable.disabled = true;
                notificationManager.initialize();
            }

            btnEnable.addEventListener('click', async () => {
                btnEnable.disabled = true;
                try {
                    const success = await notificationManager.initialize();
                    if (success) {
                        btnEnable.textContent = 'Notifiche Attive';
                        btnEnable.disabled = true;
                    }
                } catch (error) {
                    console.error('Errore durante l\'attivazione delle notifiche:', error);
                    btnEnable.disabled = false;
                }
            });
        });
    </script>
</body>
</html> 