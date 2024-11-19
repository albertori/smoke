window.NSA.LocationMap = function LocationMap() {
    const mapRef = React.useRef(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const API_KEY = 'AIzaSyBhmI0deKA75PH3zEOB30E1erItblUI9qk';
    const scriptId = 'google-maps-script';

    // ... resto del codice del componente LocationMap ...

    return (
        <div className="location-card">
            <h5 className="card-title mb-3">
                <i className="bi bi-geo-alt"></i> Dove Siamo
            </h5>
            <div className="map-wrapper">
                <div 
                    ref={mapRef} 
                    className="map-container"
                    style={{ opacity: isLoading ? 0 : 1 }}
                />
                {isLoading && (
                    <div className="loading-overlay">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Caricamento...</span>
                        </div>
                        <p className="mt-2">Caricamento della mappa in corso...</p>
                    </div>
                )}
                {error && (
                    <div className="alert alert-danger mt-3">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                    </div>
                )}
            </div>
            
            <div className="address-box">
                <div className="d-flex align-items-center">
                    <i className="bi bi-pin-map-fill address-icon"></i>
                    <div>
                        <h6 className="address-title">Il nostro indirizzo</h6>
                        <p className="address-text">Piazza Carnaro 8/a</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 