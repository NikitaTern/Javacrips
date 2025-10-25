import React from 'react';
import Header from './Header/Header';
import MapContainer from './MapContainer/MapContainer';
import AddressSection from './AddressSection/AddressSection';
import Footer from './Footer/Footer';
import './App.css';

const App = () => {
    return (
        <div className="app">
            <Header />

            {/* Мобильная версия - показывается только на mobile */}
            <div className="app-mobile">
                <MapContainer isMobile={true} />
                <AddressSection isMobile={true} />
            </div>

            {/* Десктоп версия - показывается только на desktop */}
            <div className="app-desktop">
                <MapContainer isMobile={false} />
                <AddressSection isMobile={false} />
            </div>

            <Footer />
        </div>
    );
};

export default App;
