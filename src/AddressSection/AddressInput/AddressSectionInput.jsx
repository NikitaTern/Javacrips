import React from 'react';
import './AddressSectionInput.css';

const AddressInput = ({ index, value, onChange, onRemove, showRemove }) => {
    return (
        <div className="input-group">
            <span className="input-label">Точка {index + 1}</span>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(index, e.target.value)}
                placeholder="Введите адрес..."
                className="address-input"
            />
            {showRemove && (
                <button
                    className="remove-btn"
                    onClick={() => onRemove(index)}
                    aria-label="Удалить точку"
                >
                    ×
                </button>
            )}
        </div>
    );
};

export default AddressInput;