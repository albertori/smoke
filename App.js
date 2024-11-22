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
        'Pod Systems': [
            { name: 'JustFog', icon: 'bi-circle' },
            { name: 'Uwell', icon: 'bi-square' },
            { name: 'Voopoo', icon: 'bi-triangle' },
            { name: 'SMOK', icon: 'bi-star' }
        ],
        'Box Mod': [
            { name: 'Vaporesso', icon: 'bi-circle-fill' },
            { name: 'Geekvape', icon: 'bi-square-fill' },
            { name: 'Lost Vape', icon: 'bi-triangle-fill' },
            { name: 'Aspire', icon: 'bi-star-fill' }
        ],
        'Starter Kit': [
            { name: 'Innokin', icon: 'bi-heart' },
            { name: 'Eleaf', icon: 'bi-heart-fill' },
            { name: 'Joyetech', icon: 'bi-diamond' },
            { name: 'Kanger', icon: 'bi-diamond-fill' }
        ]
    };

    return (
        <div className="brands-section mt-5">
            <h3 className="text-center mb-5">I Nostri Marchi</h3>
            {Object.entries(categories).map(([category, brands]) => (
                <div key={category} className="mb-5">
                    <h5 className="category-title mb-4">{category}</h5>
                    <div className="row g-4">
                        {brands.map((brand, index) => (
                            <div key={index} className="col-md-3">
                                <div className="brand-card text-center p-4">
                                    <i className={`bi ${brand.icon} brand-icon mb-3`}></i>
                                    <h6 className="brand-name">{brand.name}</h6>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
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
    const [orari, setOrari] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetch('/nuovo_nsa/orari.txt')
            .then(response => response.text())
            .then(data => {
                const righe = data.split('\n').map(riga => {
                    const [giorno, mattina, pomeriggio] = riga.split(';');
                    return { giorno, mattina, pomeriggio };
                });
                setOrari(righe);
                setLoading(false);
            })
            .catch(error => {
                console.error('Errore nel caricamento degli orari:', error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="text-center p-3">Caricamento orari...</div>;
    }

    return (
        <div className="tab-pane active">
            <h6 className="mb-3">Orari di apertura</h6>
            <div className="list-group">
                {orari.map((orario, index) => (
                    <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <strong>{orario.giorno}</strong>
                        <div>
                            <span className="badge bg-primary me-2">{orario.mattina}</span>
                            {orario.pomeriggio !== 'Chiuso' && 
                                <span className="badge bg-primary">{orario.pomeriggio}</span>
                            }
                            {orario.pomeriggio === 'Chiuso' && orario.mattina !== 'Chiuso' &&
                                <span className="badge bg-secondary">Chiuso</span>
                            }
                            {orario.mattina === 'Chiuso' &&
                                <span className="badge bg-secondary">Chiuso</span>
                            }
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
            </div>
            <BrandsList />
            <NicCalculator />
            <Features />
            <Newsletter />
        </div>
    );
};

// ============================================
// Rendering dell'applicazione - DEVE ESSERE ALLA FINE
// ============================================
ReactDOM.render(<App />, document.getElementById('root')); 