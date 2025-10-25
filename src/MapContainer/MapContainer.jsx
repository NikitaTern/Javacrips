import React from 'react';
import './MapContainer.css';

const MapContainer = () => {
    const handleCurrentLocation = () => {
        console.log('Определение текущего местоположения...');
    };

    return (
        <>
            {/* Мобильная версия */}
            <div className="map-container-mobile">
                <span>Интерактивная карта - Mobile</span>
                <div className="map-overlay">
                    <button
                        className="current-location-btn"
                        onClick={handleCurrentLocation}
                    >
                        📍 Моё местоположение
                    </button>
                </div>
            </div>

            {/* Десктоп версия */}
            <div className="map-container-desktop">
                <span>Интерактивная карта - Desktop (полный размер)</span>
                <div className="map-overlay">
                    <button
                        className="current-location-btn"
                        onClick={handleCurrentLocation}
                    >
                        📍 Моё местоположение
                    </button>
                </div>
            </div>
        </>
    );
};

export default MapContainer;