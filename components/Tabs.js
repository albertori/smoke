function Tabs({ activeTab, setActiveTab }) {
    return (
        <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
                <a className={`nav-link ${activeTab === 'hours' ? 'active' : ''}`}
                   onClick={(e) => { e.preventDefault(); setActiveTab('hours'); }} 
                   href="#">
                    <i className="bi bi-clock"></i> Orari
                </a>
            </li>
            <li className="nav-item">
                <a className={`nav-link ${activeTab === 'map' ? 'active' : ''}`} 
                   onClick={(e) => { e.preventDefault(); setActiveTab('map'); }} 
                   href="#">
                    <i className="bi bi-geo-alt"></i> Mappa
                </a>
            </li>
            <li className="nav-item">
                <a className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
                   onClick={(e) => { e.preventDefault(); setActiveTab('info'); }} 
                   href="#">
                    <i className="bi bi-info-circle"></i> Info
                </a>
            </li>
        </ul>
    );
} 