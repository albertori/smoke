// Componente Mappa
function LocationMap() {
    // ... codice del componente LocationMap ...
}

// Componente Brand
function BrandsList() {
    // ... codice del componente BrandsList ...
}

// Inizializzazione quando il documento è pronto
document.addEventListener('DOMContentLoaded', function() {
    ReactDOM.render(<LocationMap />, document.getElementById('mapRoot'));
    ReactDOM.render(<BrandsList />, document.getElementById('brandsRoot'));
}); 