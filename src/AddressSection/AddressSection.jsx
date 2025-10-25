import React, { useState } from 'react';
import AddressInput from "./AddressInput/AddressSectionInput.jsx";
import './AddressInput/AddressSectionInput.css';

const AddressSection = ({ isMobile }) => {
    const [addresses, setAddresses] = useState(['', '']);

    const addAddressField = () => {
        setAddresses([...addresses, '']);
    };

    const handleAddressChange = (index, value) => {
        const newAddresses = [...addresses];
        newAddresses[index] = value;
        setAddresses(newAddresses);
    };

    const removeAddress = (index) => {
        if (addresses.length > 2) {
            setAddresses(addresses.filter((_, i) => i !== index));
        }
    };

    const handleCalculateRoute = () => {
        const validAddresses = addresses.filter(addr => addr.trim() !== '');
        console.log('Расчет маршрута для адресов:', validAddresses);
    };

    return (
        <div className={`address-section ${isMobile ? 'mobile' : 'desktop'}`}>
            <div className="address-content">
                <div className="address-header">
                    <h2>Маршрут</h2>
                    <button
                        className="add-address-btn"
                        onClick={addAddressField}
                    >
                        + Добавить точку
                    </button>
                </div>

                <div className="address-inputs-container">
                    <div className="address-inputs">
                        {addresses.map((address, index) => (
                            <AddressInput
                                key={index}
                                index={index}
                                value={address}
                                onChange={handleAddressChange}
                                onRemove={removeAddress}
                                showRemove={index > 1}
                            />
                        ))}
                    </div>
                </div>

                <button
                    className="calculate-route-btn"
                    onClick={handleCalculateRoute}
                >
                    🚗 Построить маршрут
                </button>
            </div>
        </div>
    );
};

export default AddressSection;