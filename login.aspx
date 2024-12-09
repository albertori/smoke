<%@ Page Language="C#" AutoEventWireup="true" CodeFile="login.aspx.cs" Inherits="NomeProgetto.login" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Accedi - Non Ho Fumato</title>
    
    <!-- PWA Meta Tags -->
    <link rel="manifest" href="manifest.json">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="application-name" content="Non Ho Fumato">
    <meta name="apple-mobile-web-app-title" content="Non Ho Fumato">
    <meta name="theme-color" content="#4CAF50">
    <meta name="msapplication-navbutton-color" content="#4CAF50">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    
    <!-- Aggiungi jQuery prima di bootstrap -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="stylesheet" href="Styles/login.css" />
</head>
<body>
    <form id="form1" runat="server">
        <div class="container">
            <div class="login-container">
                <div class="text-center mb-4">
                    <i class="fas fa-smoking-ban icon-logo"></i>
                    <h2>Non Ho Fumato</h2>
                    <p class="text-muted">Accedi per tracciare i tuoi progressi</p>
                </div>
                
                <div class="mb-4">
                    <label for="txtEmail" class="form-label">Email</label>
                    <asp:TextBox ID="txtEmail" runat="server" 
                        CssClass="form-control form-control-lg" 
                        TextMode="Email" 
                        placeholder="esempio@email.com">
                    </asp:TextBox>
                    <asp:RequiredFieldValidator ID="rfvEmail" runat="server" 
                        ControlToValidate="txtEmail" 
                        ErrorMessage="Inserisci la tua email" 
                        CssClass="text-danger small">
                    </asp:RequiredFieldValidator>
                </div>

                <div class="mb-4">
                    <label for="txtPassword" class="form-label d-flex justify-content-between">
                        Password 
                        <small class="text-muted">(opzionale)</small>
                    </label>
                    <div class="input-group">
                        <asp:TextBox ID="txtPassword" runat="server" 
                            CssClass="form-control form-control-lg" 
                            TextMode="Password" 
                            placeholder="Password (opzionale)">
                        </asp:TextBox>
                        <button class="btn btn-outline-secondary" type="button" id="togglePassword">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    <small class="form-text text-muted">
                        Puoi aggiungere una password in seguito dalle impostazioni
                    </small>
                </div>

                <div class="mb-4">
                    <asp:Button ID="btnAccedi" runat="server" 
                        Text="Accedi" 
                        CssClass="btn btn-primary btn-lg w-100" 
                        OnClick="btnAccedi_Click" />
                </div>

                <asp:Label ID="lblErrore" runat="server" 
                    CssClass="alert alert-danger w-100 text-center" 
                    Visible="false">
                </asp:Label>
            </div>
        </div>
    </form>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Toggle password visibility
        document.getElementById('togglePassword').addEventListener('click', function() {
            const password = document.getElementById('<%= txtPassword.ClientID %>');
            const icon = this.querySelector('i');
            
            if (password.type === 'password') {
                password.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                password.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    </script>
</body>
</html> 