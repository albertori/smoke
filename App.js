// ============================================
// Componente Tabs - DEVE ESSERE DEFINITO PRIMA
// ============================================
const Tabs = ({ activeTab, setActiveTab }) => {
    return (
        <ul className="nav nav-pills nav-fill flex-column flex-md-row mb-3">
            <li className="nav-item mb-2 mb-md-0">
                <a className={`nav-link ${activeTab === 'hours' ? 'active' : ''}`}
                   onClick={(e) => { e.preventDefault(); setActiveTab('hours'); }} 
                   href="#">
                    <i className="bi bi-clock me-2"></i>
                    <span>Orari</span>
                </a>
            </li>
            <li className="nav-item mb-2 mb-md-0">
                <a className={`nav-link ${activeTab === 'map' ? 'active' : ''}`} 
                   onClick={(e) => { e.preventDefault(); setActiveTab('map'); }} 
                   href="#">
                    <i className="bi bi-geo-alt me-2"></i>
                    <span>Mappa</span>
                </a>
            </li>
            <li className="nav-item mb-2 mb-md-0">
                <a className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
                   onClick={(e) => { e.preventDefault(); setActiveTab('info'); }} 
                   href="#">
                    <i className="bi bi-info-circle me-2"></i>
                    <span>Info</span>
                </a>
            </li>
            <li className="nav-item mb-2 mb-md-0">
                <a className={`nav-link ${activeTab === 'aromi' ? 'active' : ''}`}
                   onClick={(e) => { e.preventDefault(); setActiveTab('aromi'); }} 
                   href="#">
                    <i className="bi bi-search me-2"></i>
                    <span>Aromi</span>
                </a>
            </li>
        </ul>
    );
};

// ============================================
// Componente LocationMap
// ============================================
const LocationMap = () => {
    const mapRef = React.useRef(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const API_KEY = 'AIzaSyBhmI0deKA75PH3zEOB30E1erItblUI9qk';
    const scriptId = 'google-maps-script';

    React.useEffect(() => {
        let isMounted = true;

        const initMap = () => {
            if (!mapRef.current || !isMounted) return;

            try {
                const location = { 
                    lat: 41.940270, 
                    lng: 12.531830 
                };

                const map = new window.google.maps.Map(mapRef.current, {
                    zoom: 16,
                    center: location,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                    zoomControl: true,
                });

                const marker = new window.google.maps.Marker({
                    position: location,
                    map: map,
                    title: 'NoSmokingArea'
                });

                if (isMounted) {
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Errore mappa:', err);
                if (isMounted) {
                    setError('Errore nel caricamento della mappa');
                    setIsLoading(false);
                }
            }
        };

        const loadGoogleMaps = () => {
            if (document.getElementById(scriptId)) {
                if (window.google && window.google.maps) {
                    initMap();
                }
                return;
            }

            const script = document.createElement('script');
            script.id = scriptId;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
            script.async = true;
            script.defer = true;

            script.onload = () => {
                if (isMounted) {
                    initMap();
                }
            };

            script.onerror = () => {
                if (isMounted) {
                    setError('Errore nel caricamento di Google Maps');
                    setIsLoading(false);
                }
            };

            document.head.appendChild(script);
        };

        loadGoogleMaps();

        return () => {
            isMounted = false;
        };
    }, []);

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
};

// ============================================
// Componente BrandsList
// ============================================
const BrandsList = () => {
    const categories = {
        'Hardware': [
            { name: 'JustFog', icon: 'bi-cpu' },
            { name: 'Uwell', icon: 'bi-cpu' },
            { name: 'Voopoo', icon: 'bi-cpu' },
            { name: 'SMOK', icon: 'bi-cpu' },
            { name: 'Vaporesso', icon: 'bi-cpu' },
            { name: 'Geekvape', icon: 'bi-cpu' },
            { name: 'Lost Vape', icon: 'bi-cpu' },
            { name: 'Aspire', icon: 'bi-cpu' },
            { name: 'Innokin', icon: 'bi-cpu' },
            { name: 'Eleaf', icon: 'bi-cpu' }
        ],
        'Aromi': [
            { name: 'TNT Vape', icon: 'bi-droplet' },
            { name: 'La Tabaccheria', icon: 'bi-droplet' },
            { name: 'Vaporart', icon: 'bi-droplet' },
            { name: 'Flavourart', icon: 'bi-droplet' },
            { name: 'Dea', icon: 'bi-droplet' },
            { name: 'Suprem-e', icon: 'bi-droplet' },
            { name: 'Blendfeel', icon: 'bi-droplet' },
            { name: 'Shot Series', icon: 'bi-droplet' }
        ],
        'Accessori': [
            { name: 'Cotton Bacon', icon: 'bi-tools' },
            { name: 'Coil Master', icon: 'bi-tools' },
            { name: 'Wotofo', icon: 'bi-tools' },
            { name: 'Vandy Vape', icon: 'bi-tools' },
            { name: 'Fiber Freaks', icon: 'bi-tools' },
            { name: 'Kendo', icon: 'bi-tools' }
        ]
    };

    return (
        <div className="brands-section py-5 bg-light">
            <div className="container">
                <h3 className="text-center mb-4">I Nostri Marchi</h3>
                <div className="row g-4">
                    {Object.entries(categories).map(([category, brands]) => (
                        <div key={category} className="col-md-4">
                            <div className="category-card h-100 bg-white rounded-3 p-3 shadow-sm">
                                <h5 className="category-title border-bottom pb-2 mb-3">
                                    <i className={`bi ${
                                        category === 'Hardware' ? 'bi-cpu' : 
                                        category === 'Aromi' ? 'bi-droplet' : 
                                        'bi-tools'
                                    } me-2`}></i>
                                    {category}
                                </h5>
                                <div className="row row-cols-2 g-2">
                                    {brands.map((brand, index) => (
                                        <div key={index} className="col">
                                            <div className="brand-item d-flex align-items-center p-2 rounded-2 border">
                                                <i className={`bi ${brand.icon} me-2 text-primary`}></i>
                                                <span className="brand-name">{brand.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ============================================
// Componente NicCalculator - Aggiungi questo componente prima di Features
// ============================================
const NicCalculator = () => {
    const [targetVolume, setTargetVolume] = React.useState(100);
    const [targetStrength, setTargetStrength] = React.useState(8);
    const [baseStrength, setBaseStrength] = React.useState(20); // Forza del booster
    const [result, setResult] = React.useState(null);

    // Array delle concentrazioni disponibili per i booster
    const availableStrengths = [4, 8, 9, 12, 16, 18, 20];

    const calculateNicotine = (e) => {
        e.preventDefault();
        const baseVolume = 10; // Volume fisso del booster (10ml)
        
        // Calcoli con supporto decimale
        const nicVolumeNeeded = (targetVolume * targetStrength) / baseStrength;
        const bottlesNeeded = Math.ceil(nicVolumeNeeded / baseVolume);
        const pureBaseNeeded = targetVolume - (bottlesNeeded * baseVolume);
        const actualStrength = ((bottlesNeeded * baseVolume * baseStrength) / targetVolume);

        setResult({
            bottles: bottlesNeeded,
            pureBase: Math.max(0, parseFloat(pureBaseNeeded.toFixed(1))),
            totalVolume: parseFloat((bottlesNeeded * baseVolume + Math.max(0, pureBaseNeeded)).toFixed(1)),
            actualStrength: parseFloat(actualStrength.toFixed(1))
        });
    };

    return (
        <div id="nicCalculator" className="nic-calculator-section py-5 bg-light">
            <div className="container">
                <h4 className="text-center mb-4">Calcolatore Diluizione Nicotina</h4>
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <div className="card shadow">
                            <div className="card-body">
                                <form onSubmit={calculateNicotine}>
                                    <div className="mb-3">
                                        <label className="form-label">Volume finale desiderato (ml)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={targetVolume}
                                            onChange={(e) => setTargetVolume(Number(e.target.value))}
                                            min="1"
                                            step="0.1"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Concentrazione nicotina desiderata (mg/ml)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={targetStrength}
                                            onChange={(e) => setTargetStrength(Number(e.target.value))}
                                            min="0"
                                            max="20"
                                            step="0.1"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Concentrazione booster (mg/ml)</label>
                                        <select 
                                            className="form-select"
                                            value={baseStrength}
                                            onChange={(e) => setBaseStrength(Number(e.target.value))}
                                        >
                                            {availableStrengths.map(strength => (
                                                <option key={strength} value={strength}>
                                                    {strength} mg/ml
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100">
                                        Calcola
                                    </button>
                                </form>

                                {result && (
                                    <div className="mt-4">
                                        <h6 className="mb-3">Risultato:</h6>
                                        <ul className="list-group">
                                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                                Shot nicotina necessari (10ml/{baseStrength}mg):
                                                <span className="badge bg-primary rounded-pill">{result.bottles}</span>
                                            </li>
                                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                                Base neutra da aggiungere:
                                                <span className="badge bg-primary rounded-pill">{result.pureBase}ml</span>
                                            </li>
                                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                                Volume totale finale:
                                                <span className="badge bg-primary rounded-pill">{result.totalVolume}ml</span>
                                            </li>
                                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                                Concentrazione nicotina finale:
                                                <span className="badge bg-primary rounded-pill">{result.actualStrength}mg/ml</span>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================
// Componente Features
// ============================================
const Features = () => {
    return (
        <div className="features-section py-5">
            <div className="row g-4">
                <div className="col-md-4">
                    <div className="feature-card text-center p-4">
                        <i className="bi bi-shield-check feature-icon"></i>
                        <h5 className="mt-3">Prodotti Certificati</h5>
                        <p className="text-muted">Solo prodotti originali con garanzia ufficiale</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="feature-card text-center p-4">
                        <i className="bi bi-people feature-icon"></i>
                        <h5 className="mt-3">Consulenza Esperta</h5>
                        <p className="text-muted">Staff qualificato per guidarti nella scelta</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="feature-card text-center p-4">
                        <i className="bi bi-arrow-repeat feature-icon"></i>
                        <h5 className="mt-3">Assistenza Post-Vendita</h5>
                        <p className="text-muted">Supporto continuo dopo l'acquisto</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================
// Componente Newsletter
// ============================================
const Newsletter = () => {
    return (
        <div className="newsletter-section text-center py-5 mt-5 bg-light">
            <div className="container">
                <h4 className="mb-3">Resta aggiornato</h4>
                <p className="text-muted mb-4">Iscriviti alla newsletter per ricevere novità e offerte speciali</p>
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="input-group mb-3">
                            <input type="email" className="form-control" placeholder="La tua email" />
                            <button className="btn btn-primary" type="button">Iscriviti</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================
// Componente HoursTab
// ============================================
const HoursTab = () => {
    const orari = [
        { giorno: 'Lunedì', mattina: '09:30-13:00', pomeriggio: '16:00-20:00' },
        { giorno: 'Martedì', mattina: '09:30-13:00', pomeriggio: '16:00-20:00' },
        { giorno: 'Mercoledì', mattina: '09:30-13:00', pomeriggio: '16:00-20:00' },
        { giorno: 'Giovedì', mattina: '09:30-13:00', pomeriggio: '16:00-20:00' },
        { giorno: 'Venerdì', mattina: '09:30-13:00', pomeriggio: '16:00-20:00' },
        { giorno: 'Sabato', mattina: '09:30-13:00', pomeriggio: '16:00-20:00' },
        { giorno: 'Domenica', mattina: 'Chiuso', pomeriggio: 'Chiuso' }
    ];

    return (
        <div className="hours-card">
            <h5 className="card-title mb-3">
                <i className="bi bi-clock"></i> Orari di Apertura
            </h5>
            <div className="hours-list">
                {orari.map((orario, index) => (
                    <div key={index} className="hours-item d-flex justify-content-between align-items-center mb-2">
                        <span className="day">{orario.giorno}</span>
                        <div className="hours">
                            {orario.mattina === 'Chiuso' && orario.pomeriggio === 'Chiuso' ? (
                                <span className="badge bg-secondary">Chiuso</span>
                            ) : (
                                <div className="d-flex">
                                    {orario.mattina !== 'Chiuso' && 
                                        <span className="badge bg-primary me-2">{orario.mattina}</span>
                                    }
                                    {orario.pomeriggio !== 'Chiuso' && 
                                        <span className="badge bg-primary">{orario.pomeriggio}</span>
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================
// Componente SearchAromi
// ============================================
const SearchAromi = () => {
    const [aromi, setAromi] = React.useState([]);
    const [marcaSearch, setMarcaSearch] = React.useState('');
    const [saporeSearch, setSaporeSearch] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        fetch('/magazzino/GetLiquidi.aspx')
            .then(response => response.json())
            .then(data => {
                setAromi(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Errore:', err);
                setError('Errore nel caricamento degli aromi');
                setLoading(false);
            });
    }, []);

    // Filtriamo per entrambi i criteri
    const aromiFiltrati = aromi.filter(aroma => 
        aroma.Marca.toLowerCase().includes(marcaSearch.toLowerCase()) && 
        aroma.Descrizione.toLowerCase().includes(saporeSearch.toLowerCase()) && 
        aroma.Disponibilita === true
    );

    if (loading) return <div className="text-center p-4">Caricamento aromi...</div>;
    if (error) return <div className="text-center p-4 text-danger">{error}</div>;

    return (
        <div className="aromi-container">
            {/* Barra di ricerca */}
            <div className="row g-2 mb-4">
                <div className="col-12 col-md-6">
                    <div className="input-group">
                        <span className="input-group-text bg-white">
                            <i className="bi bi-shop"></i>
                        </span>
                        <input 
                            type="text" 
                            className="form-control"
                            placeholder="Cerca per marca..." 
                            value={marcaSearch}
                            onChange={(e) => setMarcaSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <div className="input-group">
                        <span className="input-group-text bg-white">
                            <i className="bi bi-search"></i>
                        </span>
                        <input 
                            type="text" 
                            className="form-control"
                            placeholder="Cerca per sapore..." 
                            value={saporeSearch}
                            onChange={(e) => setSaporeSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Lista aromi - Versione Desktop */}
            <div className="d-none d-lg-block">
                {aromiFiltrati.length === 0 ? (
                    <div className="text-center">
                        <p className="text-muted">Nessun aroma trovato</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover table-sm align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Marca</th>
                                    <th>Nome</th>
                                    <th>Descrizione</th>
                                    <th>Formato</th>
                                    <th>Nicotina</th>
                                </tr>
                            </thead>
                            <tbody>
                                {aromiFiltrati.map((aroma, index) => (
                                    <tr key={index}>
                                        <td className="text-primary fw-semibold">{aroma.Marca}</td>
                                        <td>{aroma.Nome}</td>
                                        <td className="text-muted">{aroma.Descrizione}</td>
                                        <td>
                                            <span className="badge bg-light text-dark">
                                                {aroma.NomeFormato}
                                            </span>
                                        </td>
                                        <td>
                                            {aroma.Nicotina !== "0" ? (
                                                <span className="badge bg-info">
                                                    {aroma.Nicotina} mg
                                                </span>
                                            ) : (
                                                <span className="badge bg-secondary">
                                                    0 mg
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Lista aromi - Versione Mobile */}
            <div className="d-lg-none">
                {aromiFiltrati.length === 0 ? (
                    <div className="text-center">
                        <p className="text-muted">Nessun aroma trovato</p>
                    </div>
                ) : (
                    <div className="list-group">
                        {aromiFiltrati.map((aroma, index) => (
                            <div key={index} className="list-group-item">
                                <div className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                        <span className="text-primary fw-semibold">{aroma.Marca}</span>
                                        <div>
                                            {aroma.Nicotina !== "0" ? (
                                                <span className="badge bg-info ms-2">
                                                    {aroma.Nicotina} mg
                                                </span>
                                            ) : (
                                                <span className="badge bg-secondary ms-2">
                                                    0 mg
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mb-1">
                                        <strong>{aroma.Nome}</strong>
                                    </div>
                                    <div className="text-muted small mb-1">{aroma.Descrizione}</div>
                                    <div>
                                        <span className="badge bg-light text-dark">
                                            {aroma.NomeFormato}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================
// Componente InfoTab
// ============================================
const InfoTab = () => {
    return (
        <div className="tab-pane active">
            <h6 className="mb-3">Contatti</h6>
            <ul className="list-unstyled">
                <li className="gradient-item p-3 mb-2">
                    <i className="bi bi-geo-alt me-2"></i>
                    Piazza Carnaro 8/a
                </li>
                <li className="gradient-item p-3 mb-2">
                    <i className="bi bi-envelope me-2"></i>
                    <a href="mailto:info@nosmokingarea.it">info@nosmokingarea.it</a>
                </li>
                <li className="gradient-item p-3 mb-2">
                    <a href="https://wa.me/351665887" 
                       className="whatsapp-link text-decoration-none"
                       target="_blank"
                       rel="noopener noreferrer">
                        <div className="d-flex align-items-center">
                            <i className="bi bi-whatsapp me-2 text-success"></i>
                            <span>Scrivici su WhatsApp</span>
                            <i className="bi bi-arrow-right-circle ms-2"></i>
                        </div>
                    </a>
                </li>
            </ul>
            <div className="mt-4">
                <p className="text-muted small">
                    <i className="bi bi-info-circle me-2"></i>
                    Clicca sul pulsante WhatsApp per inviarci un messaggio diretto
                </p>
            </div>
        </div>
    );
};

// ============================================
// Componente ConsumptionCalculator
// ============================================
const ConsumptionCalculator = () => {
    const [cigarettesPerDay, setCigarettesPerDay] = React.useState(20);
    const [cigarettePackPrice, setCigarettePackPrice] = React.useState(5.20);
    const [liquidMlPerDay, setLiquidMlPerDay] = React.useState(3);
    const [liquidBottlePrice, setLiquidBottlePrice] = React.useState(20);
    const [liquidBottleSize, setLiquidBottleSize] = React.useState(10);

    // Calcoli
    const cigarettesMonthCost = (cigarettesPerDay / 20) * cigarettePackPrice * 30;
    const cigarettesYearCost = cigarettesMonthCost * 12;
    const liquidBottlesPerMonth = Math.ceil((liquidMlPerDay * 30) / liquidBottleSize);
    const liquidMonthCost = liquidBottlesPerMonth * liquidBottlePrice;
    const liquidYearCost = liquidMonthCost * 12;
    const monthlySavings = cigarettesMonthCost - liquidMonthCost;
    const yearlySavings = cigarettesYearCost - liquidYearCost;
    const dailySavings = monthlySavings / 30;  // Calcolo risparmio giornaliero

    return (
        <div className="calculator-container my-5" id="savingsCalculator">
            <div className="container">
                <div className="card shadow-sm">
                    <div className="card-header bg-primary text-white py-3">
                        <h5 className="card-title mb-0 text-center">
                            <i className="bi bi-piggy-bank me-2"></i>
                            Calcola il Tuo Risparmio
                        </h5>
                    </div>
                    <div className="card-body p-4">
                        <div className="row g-4">
                            <div className="col-md-8">
                                <div className="row g-3">
                                    {/* Input Sigarette */}
                                    <div className="col-md-6">
                                        <label className="form-label small">Sigarette al giorno</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-danger text-white">
                                                <i className="bi bi-slash-circle"></i>
                                            </span>
                                            <input 
                                                type="number" 
                                                className="form-control"
                                                value={cigarettesPerDay}
                                                onChange={(e) => setCigarettesPerDay(Number(e.target.value))}
                                                min="1"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small">Prezzo pacchetto (€)</label>
                                        <div className="input-group">
                                            <span className="input-group-text">€</span>
                                            <input 
                                                type="number" 
                                                className="form-control"
                                                value={cigarettePackPrice}
                                                onChange={(e) => setCigarettePackPrice(Number(e.target.value))}
                                                step="0.10"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    {/* Input Svapo */}
                                    <div className="col-md-4">
                                        <label className="form-label small">ML al giorno</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-primary text-white">
                                                <i className="bi bi-droplet"></i>
                                            </span>
                                            <input 
                                                type="number" 
                                                className="form-control"
                                                value={liquidMlPerDay}
                                                onChange={(e) => setLiquidMlPerDay(Number(e.target.value))}
                                                step="0.5"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small">
                                            Prezzo bottiglia liquido (€)
                                            <i className="bi bi-info-circle ms-1" 
                                               data-bs-toggle="tooltip" 
                                               data-bs-placement="top" 
                                               title="Prezzo di una bottiglia di liquido pronto (es. aroma + base)"></i>
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">€</span>
                                            <input 
                                                type="number" 
                                                className="form-control"
                                                value={liquidBottlePrice}
                                                onChange={(e) => setLiquidBottlePrice(Number(e.target.value))}
                                                step="0.50"
                                                min="0"
                                                placeholder="es. 20€"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small">Formato (ml)</label>
                                        <select 
                                            className="form-select"
                                            value={liquidBottleSize}
                                            onChange={(e) => setLiquidBottleSize(Number(e.target.value))}
                                        >
                                            <option value="10">10ml (Shot)</option>
                                            <option value="20">20ml</option>
                                            <option value="30">30ml</option>
                                            <option value="60">60ml</option>
                                            <option value="100">100ml</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Risultati */}
                            <div className="col-md-4">
                                <div className="h-100 d-flex flex-column justify-content-center">
                                    <div className="text-center p-3 bg-light rounded">
                                        <div className="mb-3">
                                            <h6 className="text-muted mb-2">Risparmio Giornaliero</h6>
                                            <h5 className="text-success mb-0">
                                                {dailySavings.toFixed(2)}€
                                            </h5>
                                        </div>
                                        <div className="mb-3">
                                            <h6 className="text-muted mb-2">Risparmio Mensile</h6>
                                            <h4 className="text-success mb-0">
                                                {monthlySavings.toFixed(2)}€
                                            </h4>
                                        </div>
                                        <div className="mb-3">
                                            <h6 className="text-muted mb-2">Risparmio Annuale</h6>
                                            <h3 className="text-success mb-0">
                                                {yearlySavings.toFixed(2)}€
                                            </h3>
                                        </div>
                                        <div>
                                            <h6 className="text-muted mb-2">Bottiglie al Mese</h6>
                                            <h5 className="text-primary mb-0">
                                                {liquidBottlesPerMonth}
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================
// Componente App principale - DEVE ESSERE DEFINITO DOPO
// ============================================
const App = () => {
    const [activeTab, setActiveTab] = React.useState('hours');

    const scrollToCalculator = (e) => {
        e.preventDefault();
        const calculator = document.getElementById('nicCalculator');
        if (calculator) {
            const headerOffset = 80;
            const elementPosition = calculator.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="app-container">
            {/* Bottone Calcolatore */}
            <div className="text-center mb-5">
                <a href="#nicCalculator" 
                   className="btn btn-primary btn-lg" 
                   onClick={scrollToCalculator}>
                    <i className="bi bi-calculator me-2"></i>
                    Calcola la tua Base Neutra
                </a>
            </div>

            {/* Resto dei componenti */}
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="tab-content">
                {activeTab === 'hours' && <HoursTab />}
                {activeTab === 'map' && <LocationMap />}
                {activeTab === 'info' && <InfoTab />}
                {activeTab === 'aromi' && <SearchAromi />}
                {activeTab === 'savingsCalculator' && <ConsumptionCalculator />}
            </div>
            <BrandsList />
            <NicCalculator />
            <ConsumptionCalculator />
            <Features />
            <Newsletter />
        </div>
    );
};

// ============================================
// Rendering dell'applicazione - DEVE ESSERE ALLA FINE
// ============================================
ReactDOM.render(<App />, document.getElementById('root')); 