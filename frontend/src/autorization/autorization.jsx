import React, { useState } from "react";
import './autorization.css';

function Autorization({ onLogin }) {
    const [window, setWindow] = useState('login');
    const [isAgreed, setIsAgreed] = useState(false); 
    
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Обработчики изменения полей - работают правильно!
    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => {
            const newData = { ...prev, [name]: value };
            return newData;
        });
        setError('');
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterData(prev => {
            const newData = { ...prev, [name]: value };
            return newData;
        });
        setError('');
    };

    
    const switchToLogin = () => {
        setWindow('login');
        setError('');
        
    };

    const switchToRegister = () => {
        setWindow('register');
        setError('');
        
    };

    const handleLogin = async () => {

        if (!isAgreed) {
            setError('Примите пользовательское соглашение');
            return;
        }

        if (!loginData.email || !loginData.password) {
            setError('Заполните все поля');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Успешный вход:', data.user);
                onLogin(data.user);
            } else {
                setError(data.error || 'Ошибка при входе');
            }
        } catch (err) {
            setError('Ошибка сервера');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!isAgreed) {
            setError('Примите пользовательское соглашение');
            return;
        }

        if (!registerData.name || !registerData.email || !registerData.password) {
            setError('Заполните все поля');
            return;
        }

        if (registerData.password.length < 6) {
            setError('Пароль должен быть минимум 6 символов');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData)
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Регистрация успешна:', data.user);
                setWindow('login');
                
                setRegisterData({ name: '', email: '', password: '' });
                setError('Регистрация успешна! Теперь войдите');
            } else {
                setError(data.error || 'Ошибка при регистрации');
            }
        } catch (err) {
            setError('Ошибка сервера');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {window === 'login' ? (
                <div className="autorization-box">
                    <div className="autorization-box-logo"></div>
                    <h1 className="autorization-box-title">SeaNet</h1>
                    <p className="autorization-box-prompting">Войдите в аккаунт, чтобы продолжить</p>
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="autorization-box-inputplace">
                        <p>Логин</p>
                        <input 
                            className="autorization-box-inputplace-input" 
                            type="text" 
                            placeholder="email"
                            name="email"
                            value={loginData.email}
                            onChange={handleLoginChange}
                            autoComplete="off"
                        />
                        <p>Пароль</p>
                        <input 
                            className="autorization-box-inputplace-input" 
                            type="password" 
                            placeholder="password"
                            name="password"
                            value={loginData.password}
                            onChange={handleLoginChange}
                            autoComplete="off"
                        />
                    </div>
                    
                    <p className="autorization-box-agreement">
                        <input 
                            type="checkbox" 
                            checked={isAgreed}
                            onChange={(e) => setIsAgreed(e.target.checked)} 
                        /> 
                        я принимаю пользовательское соглашение
                    </p>
                    
                    <button 
                        className="autorization-box-button-login"
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? 'Загрузка...' : 'Войти'}
                    </button>
                    
                    <p className="autorization-box-create-account">
                        Нет аккаунта?  
                        <button 
                            className="autorization-box-create-account-button"
                            onClick={switchToRegister}
                        >
                            Создать
                        </button>
                    </p>
                </div>
            ) : (
                <div className="autorization-box">
                    <div className="autorization-box-logo"></div>
                    <h1 className="autorization-box-title">SeaNet</h1>
                    <p className="autorization-box-prompting">Создайте аккаунт</p>
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="autorization-box-inputplace">
                        <p>Имя</p>
                        <input 
                            className="autorization-box-inputplace-input" 
                            type="text" 
                            placeholder="имя"
                            name="name"
                            value={registerData.name}
                            onChange={handleRegisterChange}
                            autoComplete="off"
                        />
                        <p>Email</p>
                        <input 
                            className="autorization-box-inputplace-input" 
                            type="email" 
                            placeholder="email"
                            name="email"
                            value={registerData.email}
                            onChange={handleRegisterChange}
                            autoComplete="off"
                        />
                        <p>Пароль</p>
                        <input 
                            className="autorization-box-inputplace-input" 
                            type="password" 
                            placeholder="пароль (мин. 6 символов)"
                            name="password"
                            value={registerData.password}
                            onChange={handleRegisterChange}
                            autoComplete="off"
                        />
                    </div>
                    
                    <button 
                        className="autorization-box-button-login"
                        onClick={handleRegister}
                        disabled={loading}
                    >
                        {loading ? 'Загрузка...' : 'Зарегистрироваться'}
                    </button>
                    
                    <p className="autorization-box-create-account">
                        Уже есть аккаунт?  
                        <button 
                            className="autorization-box-create-account-button"
                            onClick={switchToLogin}
                        >
                            Войти
                        </button>
                    </p>
                </div>
            )}
        </>
    );
}

export default Autorization;