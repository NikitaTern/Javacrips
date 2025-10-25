import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>Контакты</h3>
                    <p>romandeminov@gmail.com</p>
                    <p>+7 (928) 777-88-14</p>
                </div>
                <div className="footer-section">
                    <h3>О сервисе</h3>
                    <p>Умное построение маршрутов</p>
                    <p>Оптимизация времени в пути</p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2025 JavaCrips. Все права защищены.</p>
            </div>
        </footer>
    );
};

export default Footer;