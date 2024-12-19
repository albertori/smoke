<%@ Page Language="C#" AutoEventWireup="true" CodeFile="insertTestData.aspx.cs" Inherits="NomeProgetto.insertTestData" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Inserimento Dati Test</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
</head>
<body>
    <form id="form1" runat="server">
        <div class="container mt-4">
            <h2>Inserimento Dati Test</h2>
            
            <div class="mb-3">
                <label for="txtUserID" class="form-label">ID Utente:</label>
                <asp:TextBox ID="txtUserID" runat="server" CssClass="form-control" />
            </div>

            <div class="mb-3">
                <label class="form-label">Periodo:</label>
                <div class="form-check">
                    <asp:RadioButton ID="rbSettimanaScorsa" runat="server" GroupName="periodo" Checked="true" />
                    <label class="form-check-label" for="rbSettimanaScorsa">Settimana Scorsa</label>
                </div>
                <div class="form-check">
                    <asp:RadioButton ID="rbSettimanaCorrente" runat="server" GroupName="periodo" />
                    <label class="form-check-label" for="rbSettimanaCorrente">Settimana Corrente</label>
                </div>
            </div>

            <div class="mb-3">
                <label for="txtNumTentativi" class="form-label">Numero di Tentativi da Inserire:</label>
                <asp:TextBox ID="txtNumTentativi" runat="server" CssClass="form-control" Text="5" />
            </div>

            <asp:Button ID="btnInserisci" runat="server" Text="Inserisci Dati Test" 
                       CssClass="btn btn-primary" OnClick="btnInserisci_Click" />
            
            <asp:Label ID="lblResult" runat="server" CssClass="mt-3 d-block" />
        </div>
    </form>
</body>
</html> 