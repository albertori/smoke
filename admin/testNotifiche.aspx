<%@ Page Language="C#" AutoEventWireup="true" CodeFile="testNotifiche.aspx.cs" Inherits="NomeProgetto.Admin.TestNotifiche" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Test Notifiche - NoSmokingArea</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
</head>
<body class="bg-light">
    <form id="form1" runat="server">
        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-12 col-md-8 col-lg-6">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h2 class="card-title mb-4">Test Notifiche</h2>

                            <div class="mb-3">
                                <label for="ddlUtenti" class="form-label">Seleziona Utente</label>
                                <asp:DropDownList ID="ddlUtenti" runat="server" CssClass="form-select" />
                            </div>

                            <div class="mb-3">
                                <label for="txtTitolo" class="form-label">Titolo</label>
                                <asp:TextBox ID="txtTitolo" runat="server" CssClass="form-control" />
                            </div>

                            <div class="mb-3">
                                <label for="txtMessaggio" class="form-label">Messaggio</label>
                                <asp:TextBox ID="txtMessaggio" runat="server" CssClass="form-control" TextMode="MultiLine" Rows="3" />
                            </div>

                            <div class="mb-3">
                                <label for="txtUrl" class="form-label">URL (opzionale)</label>
                                <asp:TextBox ID="txtUrl" runat="server" CssClass="form-control" />
                            </div>

                            <asp:Button ID="btnInviaNotifica" runat="server" 
                                      Text="Invia Notifica" 
                                      CssClass="btn btn-primary w-100"
                                      OnClick="btnInviaNotifica_Click" />

                            <asp:Literal ID="litMessaggio" runat="server" />
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
</body>
</html> 