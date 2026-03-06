import React, { useState, useEffect } from 'react'; 
import './mainpage.css';
import Telegram from '../images/Telegram.png';
import licencePDF from './licence.pdf'; 

function Mainpage({ onLogout, currentUser }) { 
    
    const [posts, setPosts] = useState([]); 
    const [messages, setMessages] = useState([]);
    const [showNews, setShowNews] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [showJobs, setShowJobs] = useState(false);
    const [showMyPage, setShowMyPage] = useState(true);
    const [groups, setGroups] = useState([]);
    const [showGroups, setShowGroups] = useState(false);
    const [manuals, setManuals] = useState([]);
    const [showManuals, setShowManuals] = useState(false);
    const [newPostText, setNewPostText] = useState('');
    
    // Данные для моей страницы
    const [userProfile, setUserProfile] = useState({
        name: currentUser?.name || 'Пользователь',
        email: currentUser?.email || 'email@mail.com',
        bio: 'Расскажите о себе...',
        city: 'Город',
        birthDate: '01.01.2000',
        avatar: '',
        // Поля для резюме
        desiredJob: 'Капитан дальнего плавания',
        desiredSalary: 'от 300 000 ₽',
        education: 'Морской университет им. Макарова',
        experience: '7 лет на танкерах, 3 года капитаном',
        skills: 'Управление судном, навигация, английский язык',
        languages: 'Английский (свободно), Норвежский (базовый)',
        certificates: 'Диплом капитана, GMDSS, Медицинский сертификат'
    });
    
    const [isEditing, setIsEditing] = useState(false);
    const [showResume, setShowResume] = useState(false);
    const [editForm, setEditForm] = useState({...userProfile});

    // Загрузка данных с сервера
    useEffect(() => {
        fetchPosts();
        fetchMessages();
        fetchJobs();
        fetchGroups();
        fetchManuals(); 
    }, []);

    // Загрузка профиля пользователя 
    useEffect(() => {
        if (currentUser) {
            const savedProfile = localStorage.getItem(`userProfile_${currentUser.id}`);
            if (savedProfile) {
                const parsed = JSON.parse(savedProfile);
                setUserProfile(parsed);
                setEditForm(parsed);
            } else {
                // Новый пользователь
                const newProfile = {
                    name: currentUser.name || 'Пользователь',
                    email: currentUser.email || 'email@mail.com',
                    bio: 'Расскажите о себе...',
                    city: 'Город',
                    birthDate: '01.01.2000',
                    avatar: '',
                    desiredJob: 'Капитан дальнего плавания',
                    desiredSalary: 'от 300 000 ₽',
                    education: 'Морской университет им. Макарова',
                    experience: '7 лет на танкерах, 3 года капитаном',
                    skills: 'Управление судном, навигация, английский язык',
                    languages: 'Английский (свободно), Норвежский (базовый)',
                    certificates: 'Диплом капитана, GMDSS, Медицинский сертификат'
                };
                setUserProfile(newProfile);
                setEditForm(newProfile);
            }
        }
    }, [currentUser]);

    const fetchPosts = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/posts');
            const data = await res.json();
            setPosts(data);
        } catch (error) {
            console.error('Ошибка загрузки постов:', error);
        }
    };

    const fetchMessages = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/messages');
            const data = await res.json();
            setMessages(data);
        } catch (error) {
            console.error('Ошибка загрузки сообщений:', error);
        }
    };

    const fetchJobs = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/work');
            const data = await res.json();
            setJobs(data);
        } catch (error) {
            console.error('Ошибка загрузки вакансий:', error);
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/groups');
            const data = await res.json();
            setGroups(data);
        } catch (error) {
            console.error('Ошибка загрузки групп:', error);
        }
    };

    const fetchManuals = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/manuals');
            const data = await res.json();
            setManuals(data);
        } catch (error) {
            console.error('Ошибка загрузки руководств:', error);
        }
    };

    const getChats = () => {
        const chats = [];
        const chatIds = new Set();
        
        messages.forEach(msg => {
            const otherUser = msg.fromUserId === currentUser?.id 
                ? { id: msg.toUserId, name: msg.toUserName }
                : { id: msg.fromUserId, name: msg.fromUserName };
            
            if (!chatIds.has(otherUser.id)) {
                chatIds.add(otherUser.id);
                chats.push({
                    userId: otherUser.id,
                    userName: otherUser.name,
                    lastMessage: msg.text,
                    lastDate: msg.date,
                    unread: !msg.read && msg.toUserId === currentUser?.id
                });
            }
        });
        
        return chats;
    };

    const getChatMessages = () => {
        if (!selectedChat) return [];
        return messages.filter(msg => 
            (msg.fromUserId === currentUser?.id && msg.toUserId === selectedChat.userId) ||
            (msg.fromUserId === selectedChat.userId && msg.toUserId === currentUser?.id)
        ).sort((a, b) => new Date(a.date) - new Date(b.date));
    };



    // лайки 
    const handleLike = async (postId) => {
        try {
            const res = await fetch(`http://localhost:3001/api/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser?.id }) 
            });

            if (res.ok) {
                
                fetchPosts(); 
                
            }
        } catch (error) {
            console.error('Ошибка лайка:', error);
        }
    };

    const isLiked = (post) => {
        return post.likes?.includes(currentUser?.id);
    };

    //создание поста
    const createPost = async () => {
    if (!newPostText.trim()) {
        alert('Введите текст поста');
        return;
    }

    try {
        const res = await fetch('http://localhost:3001/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser?.id,
                userName: currentUser?.name,
                text: newPostText,
                image: ''
            })
        });

        if (res.ok) {
            setNewPostText('');
            fetchPosts(); 
        }
    } catch (error) {
        console.error('Ошибка создания поста:', error);
    }
};


    const handleMyPageClick = () => {
        setShowMyPage(true);
        setShowNews(false);
        setShowMessages(false);
        setShowJobs(false);
        setShowManuals(false);
        setShowGroups(false);    
        setSelectedChat(null);
        setIsEditing(false);
    };

    const handleNewsClick = () => {
        setShowNews(!showNews);
        setShowMessages(false);
        setShowJobs(false);
        setShowMyPage(false);
        setShowManuals(false);
        setShowGroups(false);    
        setSelectedChat(null);
        setIsEditing(false);
    };

    const handleMessagesClick = () => {
        setShowMessages(!showMessages);
        setShowNews(false);
        setShowJobs(false);
        setShowMyPage(false);
        setShowManuals(false);
        setShowGroups(false);    
        setSelectedChat(null);
        setIsEditing(false);
    };

    const handleJobsClick = () => {
        setShowJobs(!showJobs);
        setShowNews(false);
        setShowMessages(false);
        setShowMyPage(false);
        setShowManuals(false);
        setShowGroups(false);   
        setSelectedChat(null);
        setIsEditing(false);
    };

    const handleGroupsClick = () => {
        setShowGroups(!showGroups);
        setShowNews(false);
        setShowMessages(false);
        setShowJobs(false);
        setShowMyPage(false);
        setShowManuals(false);   
        setSelectedChat(null);
        setIsEditing(false);
    };

    const handleManualsClick = () => {
        setShowManuals(!showManuals);
        setShowNews(false);
        setShowMessages(false);
        setShowJobs(false);
        setShowMyPage(false);
        setShowGroups(false);    
        setSelectedChat(null);
        setIsEditing(false);
    };

    const handleEdit = () => {
        setEditForm({...userProfile});
        setIsEditing(true);
    };

    const handleSave = () => {
        setUserProfile(editForm);

        localStorage.setItem(`userProfile_${currentUser?.id}`, JSON.stringify(editForm));
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditForm({...userProfile});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className='main'>
            <div className='header'>
                <div className='header-logo'>SeaNet</div>
                <div className='header-navigation-bar'>
                    
                    <p>{userProfile.name}</p>
                    <button 
                        onClick={onLogout}
                        className='onlogout-button'
                    >
                        Выйти
                    </button>
                </div>
            </div>

            <div className='content-wrapper'>
                <div className='navigation'>
                    <button 
                        className={`navigation-button ${showMyPage ? 'active' : ''}`}
                        onClick={handleMyPageClick}
                    >
                        Моя страница
                    </button>
                    <button 
                        className={`navigation-button ${showNews ? 'active' : ''}`}
                        onClick={handleNewsClick}
                    >
                        Новости
                    </button>
                    <button 
                        className={`navigation-button ${showMessages ? 'active' : ''}`}
                        onClick={handleMessagesClick}
                    >
                        Сообщения
                    </button>
                    <button 
                        className={`navigation-button ${showJobs ? 'active' : ''}`}
                        onClick={handleJobsClick}
                    >
                        Вакансии
                    </button>
                    <button 
                        className={`navigation-button ${showGroups ? 'active' : ''}`}
                        onClick={handleGroupsClick}
                    >
                        Группы
                    </button>
                    <button 
                        className={`navigation-button ${showManuals ? 'active' : ''}`}
                        onClick={handleManualsClick}
                    >
                        Руководства
                    </button>
                </div>

                <div className='tape-wrapper'>
                    <div className='main-tape'>
                        {/* МОЯ СТРАНИЦА */}
                        {showMyPage && (
                            <div className='profile-section'>
                                <div className='profile-header'>
                                    <div className='profile-avatar'>
                                        {userProfile.avatar ? (
                                            <img src={userProfile.avatar} alt="avatar" />
                                        ) : (
                                            <div className='avatar-placeholder'>
                                                {userProfile.name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className='profile-info'>
                                        <h1 className='profile-name'>{userProfile.name}</h1>
                                        <p className='profile-email'>{userProfile.email}</p>
                                    </div>
                                </div>

                                {!isEditing ? (
                                    // РЕЖИМ ПРОСМОТРА
                                    <>
                                        <div className='profile-details'>
                                            <div className='profile-item'>
                                                <span className='profile-label'>О себе:</span>
                                                <span className='profile-value'>{userProfile.bio}</span>
                                            </div>
                                            <div className='profile-item'>
                                                <span className='profile-label'>Город:</span>
                                                <span className='profile-value'>{userProfile.city}</span>
                                            </div>
                                            <div className='profile-item'>
                                                <span className='profile-label'>Дата рождения:</span>
                                                <span className='profile-value'>{userProfile.birthDate}</span>
                                            </div>
                                            <button 
                                                className='profile-response'
                                                onClick={() => alert('Никто пока что не откликнулся на вашу вакансию')}
                                            >
                                                Отклики
                                            </button> 
                                            <button 
                                                className='profile-edit-button'
                                                onClick={handleEdit}
                                            >
                                                Редактировать профиль
                                            </button>
                                            
                                            <button 
                                                className='resume-toggle-button'
                                                onClick={() => setShowResume(!showResume)}
                                            >
                                                {showResume ? 'Скрыть резюме' : 'Показать резюме'}
                                            </button>
                                        </div>

                                        {/* РЕЗЮМЕ */}
                                        {showResume && (
                                            <div className='resume-section'>
                                                <h2 className='resume-title'>Мое резюме</h2>
                                                <div className='resume-details'>
                                                    <div className='resume-item'>
                                                        <span className='resume-label'>Желаемая должность:</span>
                                                        <span className='resume-value'>{userProfile.desiredJob}</span>
                                                    </div>
                                                    <div className='resume-item'>
                                                        <span className='resume-label'>Желаемая зарплата:</span>
                                                        <span className='resume-value'>{userProfile.desiredSalary}</span>
                                                    </div>
                                                    <div className='resume-item'>
                                                        <span className='resume-label'>Образование:</span>
                                                        <span className='resume-value'>{userProfile.education}</span>
                                                    </div>
                                                    <div className='resume-item'>
                                                        <span className='resume-label'>Опыт работы в море:</span>
                                                        <span className='resume-value'>{userProfile.experience}</span>
                                                    </div>
                                                    <div className='resume-item'>
                                                        <span className='resume-label'>Профессиональные навыки:</span>
                                                        <span className='resume-value'>{userProfile.skills}</span>
                                                    </div>
                                                    <div className='resume-item'>
                                                        <span className='resume-label'>Иностранные языки:</span>
                                                        <span className='resume-value'>{userProfile.languages}</span>
                                                    </div>
                                                    <div className='resume-item'>
                                                        <span className='resume-label'>Сертификаты/Дипломы:</span>
                                                        <span className='resume-value'>{userProfile.certificates}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    // РЕЖИМ РЕДАКТИРОВАНИЯ
                                    <div className='profile-edit-form'>
                                        <h3>Основная информация</h3>
                                        
                                        <div className='form-group'>
                                            <label>Имя:</label>
                                            <input 
                                                type='text'
                                                name='name'
                                                value={editForm.name}
                                                onChange={handleChange}
                                                className='form-input'
                                            />
                                        </div>
                                        
                                        <div className='form-group'>
                                            <label>Email:</label>
                                            <input 
                                                type='email'
                                                name='email'
                                                value={editForm.email}
                                                onChange={handleChange}
                                                className='form-input'
                                            />
                                        </div>
                                        
                                        <div className='form-group'>
                                            <label>О себе:</label>
                                            <textarea 
                                                name='bio'
                                                value={editForm.bio}
                                                onChange={handleChange}
                                                className='form-textarea'
                                                rows='2'
                                            />
                                        </div>
                                        
                                        <div className='form-group'>
                                            <label>Город:</label>
                                            <input 
                                                type='text'
                                                name='city'
                                                value={editForm.city}
                                                onChange={handleChange}
                                                className='form-input'
                                            />
                                        </div>
                                        
                                        <div className='form-group'>
                                            <label>Дата рождения:</label>
                                            <input 
                                                type='text'
                                                name='birthDate'
                                                value={editForm.birthDate}
                                                onChange={handleChange}
                                                className='form-input'
                                                placeholder='ДД.ММ.ГГГГ'
                                            />
                                        </div>

                                        <h3 className='resume-edit-title'>Мое резюме</h3>
                                        
                                        <div className='form-group'>
                                            <label>Желаемая должность:</label>
                                            <input 
                                                type='text'
                                                name='desiredJob'
                                                value={editForm.desiredJob}
                                                onChange={handleChange}
                                                className='form-input'
                                                placeholder='Капитан / Механик / Матрос...'
                                            />
                                        </div>
                                        
                                        <div className='form-group'>
                                            <label>Желаемая зарплата:</label>
                                            <input 
                                                type='text'
                                                name='desiredSalary'
                                                value={editForm.desiredSalary}
                                                onChange={handleChange}
                                                className='form-input'
                                                placeholder='от 200 000 ₽'
                                            />
                                        </div>
                                        
                                        <div className='form-group'>
                                            <label>Образование:</label>
                                            <textarea 
                                                name='education'
                                                value={editForm.education}
                                                onChange={handleChange}
                                                className='form-textarea'
                                                rows='2'
                                                placeholder='Морской колледж / Университет...'
                                            />
                                        </div>
                                        
                                        <div className='form-group'>
                                            <label>Опыт работы в море:</label>
                                            <textarea 
                                                name='experience'
                                                value={editForm.experience}
                                                onChange={handleChange}
                                                className='form-textarea'
                                                rows='3'
                                                placeholder='5 лет на танкерах, 3 года механиком...'
                                            />
                                        </div>
                                        
                                        <div className='form-group'>
                                            <label>Профессиональные навыки:</label>
                                            <textarea 
                                                name='skills'
                                                value={editForm.skills}
                                                onChange={handleChange}
                                                className='form-textarea'
                                                rows='3'
                                                placeholder='Управление судном, навигация, ремонт...'
                                            />
                                        </div>
                                        
                                        <div className='form-group'>
                                            <label>Иностранные языки:</label>
                                            <input 
                                                type='text'
                                                name='languages'
                                                value={editForm.languages}
                                                onChange={handleChange}
                                                className='form-input'
                                                placeholder='Английский (свободно)'
                                            />
                                        </div>
                                        
                                        <div className='form-group'>
                                            <label>Сертификаты/Дипломы:</label>
                                            <textarea 
                                                name='certificates'
                                                value={editForm.certificates}
                                                onChange={handleChange}
                                                className='form-textarea'
                                                rows='3'
                                                placeholder='Диплом капитана, сертификат GMDSS...'
                                            />
                                        </div>

                                        <div className='form-buttons'>
                                            <button 
                                                className='save-button'
                                                onClick={handleSave}
                                            >
                                                Сохранить
                                            </button>
                                            <button 
                                                className='cancel-button'
                                                onClick={handleCancel}
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </div>
                                )}
                                 {/* ФОРМА СОЗДАНИЯ ПОСТА */}
                                <div className='create-post-form'>
                                    <textarea
                                        className='post-textarea'
                                        placeholder='Что у вас нового?'
                                        value={newPostText}
                                        onChange={(e) => setNewPostText(e.target.value)}
                                        rows='3'
                                    />
                                    <button 
                                        className='create-post-button'
                                        onClick={createPost}
                                    >
                                        Опубликовать
                                    </button>
                                </div>

                                {/* ПОСТЫ ПОЛЬЗОВАТЕЛЯ */}
                                <div className='user-posts'>
                                    <h3>Мои посты</h3>
                                    {posts.filter(post => post.userId === currentUser?.id).map(post => (
                                        <div key={post.id} className='post'>
                                            <div className='post-header'>
                                                <strong className='post-header-username'>{post.userName}</strong>
                                                <p className='post-time'>{new Date(post.date).toLocaleString()}</p>
                                            </div>
                                            <div className='post-content'>
                                                <p>{post.text}</p>
                                                {post.image && (
                                                    <img src={post.image} alt="пост" className='post-image' />
                                                )}
                                            </div>
                                            <div className='post-footer'>
                                                ❤️ {post.likes?.length || 0}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* НОВОСТИ */}
                        {showNews && posts.map(post => (
                            <div key={post.id} className='post'>
                                <div className='post-header'>
                                    <strong className='post-header-username'>{post.userName}</strong>
                                    <p className='post-time'>    
                                        {new Date(post.date).toLocaleString('ru-RU', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false 
                                    })}</p>
                                </div>
                                <div className='post-content'>
                                    <p>{post.text}</p>
                                    {post.image && (
                                        <img 
                                            src={post.image} 
                                            alt="пост" 
                                            className='post-image'
                                        />
                                    )}
                                </div>
                                <div className='post-footer'>
                                    <button 
                                        className={`like-button ${isLiked(post) ? 'liked' : ''}`}
                                        onClick={() => handleLike(post.id)}
                                    >
                                        ❤️ {post.likes?.length || 0}
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* СООБЩЕНИЯ */}
                        {showMessages && (
                            <div className='messages-section'>
                                {!selectedChat ? (
                                    <div className='chats-list'>
                                        <h3 className='message-title'>Диалоги</h3>
                                        <input placeholder='Найти' className='find-Chat' />
                                        {getChats().map(chat => (
                                            <div 
                                                key={chat.userId}
                                                className='chat-item'
                                                onClick={() => setSelectedChat(chat)}
                                            >
                                                <div className='chat-avatar'>
                                                    {chat.userName[0]}
                                                </div>
                                                <div className='chat-info'>
                                                    <div className='chat-name'>{chat.userName}</div>
                                                    <div className='chat-last-message'>{chat.lastMessage}</div>
                                                </div>
                                                {chat.unread && <div className='unread-badge'>1</div>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className='chat-window'>
                                        <div className='chat-header'>
                                            <button 
                                                className='back-button'
                                                onClick={() => setSelectedChat(null)}
                                            >
                                                ← Назад
                                            </button>
                                            <h3>{selectedChat.userName}</h3>
                                        </div>
                                        
                                        <div className='messages-list'>
                                            {getChatMessages().map(msg => (
                                                <div 
                                                    key={msg.id}
                                                    className={`message ${msg.fromUserId === currentUser?.id ? 'my-message' : 'their-message'}`}
                                                >
                                                    <div className='message-content'>{msg.text}</div>
                                                    <div className='message-time'>
                                                        {new Date(msg.date).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ВАКАНСИИ */}
                        {showJobs && (
                            <div className='jobs-section'>
                                <h2 className='jobs-title'>Вакансии</h2>
                                <input placeholder='Найти' className='find-Chat' />
                                <div className='jobs-list'>
                                    {jobs.map(job => (
                                        <div key={job.id} className='job-card'>
                                            <div className='job-header'>
                                                <h3 className='job-title'>{job.title}</h3>
                                                <span className='job-salary'>{job.salary}</span>
                                            </div>
                                            <div className='job-company'>{job.company}</div>
                                            <div className='job-location'>{job.location}</div>
                                            <p className='job-description'>{job.description}</p>
                                            <div className='job-requirements'>
                                                <strong>Требования:</strong> {job.requirements}
                                            </div>
                                            <div className='job-footer'>
                                                <span className='job-date'>{job.date}</span>
                                                <button 
                                                    className='job-apply'
                                                    onClick={() => alert('Ваше резюме отправлено работодателю!')}
                                                >
                                                    Откликнуться
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* ГРУППЫ */}
                        {showGroups && (
                            <div className='groups-section'>
                                <h2 className='groups-title'>Группы</h2>
                                <input placeholder='Найти' className='find-Chat' />
                                
                                <div className='groups-list'>
                                    {groups.map(group => (
                                        <div key={group.id} className='group-card'>
                                            <div className='group-image'>
                                                <img 
                                                    src={group.image} 
                                                    alt={group.name}
                                                    
                                                />
                                            </div>
                                            <div className='group-content'>
                                                <div className='group-header'>
                                                    <h3 className='group-name'>{group.name}</h3>
                                                    <span className='group-type'>{group.type}</span>
                                                </div>
                                                <p className='group-description'>{group.description}</p>
                                                <div className='group-footer'>
                                                    <span className='group-members'>{group.members.toLocaleString()} участников</span>
                                                    <span className='group-created'>Создана: {group.created}</span>
                                                </div>
                                                <button 
                                                    className='group-join-button'
                                                    onClick={() => alert(`Заявка на вступление в группу "${group.name}" отправлена!`)}
                                                >
                                                    Отправить заявку
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* РУКОВОДСТВА */}
                            {showManuals && (
                                <div className='manuals-section'>
                                    <h2 className='manuals-title'>Руководства</h2>
                                    <input placeholder='Найти' className='find-Chat' />
                                    <div className='manuals-list'>
                                        {manuals.map(ship => (
                                            <div key={ship.id} className='manual-card'>
                                                <div className='manual-image'>
                                                    <img 
                                                        src={ship.image} 
                                                        alt={ship.name} 
                                                    />
                                                </div>
                                                <div className='manual-content'>
                                                    <h3 className='manual-name'>{ship.name}</h3>
                                                    <p className='manual-type'>Тип: {ship.type} | Год: {ship.year}</p>
                                                    <p className='manual-description'>{ship.description}</p>
                                                    <a 
                                                        href={encodeURI(ship.link)} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className='manual-link'
                                                    >
                                                        Подробнее
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                    </div>
                </div>
            </div>
            <div className='footer'>
                <div className='copyright-policy-contacts'>
                    <a 
                        href={licencePDF} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="footer-link"
                    >
                        Пользовательское соглашение
                    </a>
                    <a>Контактная информация</a>
                    <a>@Copyright</a>
                    <img src={Telegram} alt="Telegram" className='telegram-icon' href="https://github.com/"/>
                </div>
            </div>
        </div>
    );
}

export default Mainpage;