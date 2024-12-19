<%@ Page Language="C#" AutoEventWireup="true" CodeFile="debugStats.aspx.cs" Inherits="NomeProgetto.debugStats" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Debug Statistiche</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
</head>
<body>
    <form id="form1" runat="server">
        <div class="container mt-4">
            <h2>Debug Statistiche</h2>
            
            <div class="card mb-3">
                <div class="card-header">
                    <h5>Panoramica Dati</h5>
                </div>
                <div class="card-body">
                    <p>Totale Record: <asp:Label ID="lblTotaleRecord" runat="server" /></p>
                    <p>Prima Data: <asp:Label ID="lblPrimaData" runat="server" /></p>
                    <p>Ultima Data: <asp:Label ID="lblUltimaData" runat="server" /></p>
                </div>
            </div>

            <div class="card mb-3">
                <div class="card-header">
                    <h5>Dati per Ora</h5>
                </div>
                <div class="card-body">
                    <asp:GridView ID="gvOre" runat="server" CssClass="table table-striped">
                        <Columns>
                            <asp:BoundField DataField="Ora" HeaderText="Ora" />
                            <asp:BoundField DataField="Conteggio" HeaderText="Conteggio" />
                        </Columns>
                    </asp:GridView>
                </div>
            </div>

            <div class="card mb-3">
                <div class="card-header">
                    <h5>Confronto Settimanale</h5>
                </div>
                <div class="card-body">
                    <p>Settimana Corrente: <asp:Label ID="lblSettimanaCorrente" runat="server" /></p>
                    <p>Settimana Scorsa: <asp:Label ID="lblSettimanaScorsa" runat="server" /></p>
                </div>
            </div>

            <div class="card mb-3">
                <div class="card-header">
                    <h5>Query SQL Utilizzate</h5>
                </div>
                <div class="card-body">
                    <pre><asp:Label ID="lblQueries" runat="server" /></pre>
                </div>
            </div>
        </div>
    </form>
</body>
</html> 