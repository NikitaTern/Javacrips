import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>Контакты</h3>
                    <p>support@smartmaps.ru</p>
                    <p>+7 (999) 123-45-67</p>
                </div>
                <div className="footer-section">
                    <h3>О сервисе</h3>
                    <p>Умное построение маршрутов</p>
                    <p>Оптимизация времени в пути</p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2024 SmartMaps. Все права защищены.</p>
            </div>
        </footer>
    );
};

export default Footer;