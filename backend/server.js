const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Статические файлы (картинки)
app.use('/images', express.static(path.join(__dirname, 'images')));

// ----- ПУТИ К ФАЙЛАМ -----
const USERS_FILE = path.join(__dirname, 'users.json');
const POSTS_FILE = path.join(__dirname, 'posts.json');
const GROUPS_FILE = path.join(__dirname, 'groups.json');
const MANUALS_FILE = path.join(__dirname, 'manuals.json');
const MESSAGES_FILE = path.join(__dirname, 'messages.json');
const WORK_FILE = path.join(__dirname, 'work.json');

// ============================================
// ======== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
// ============================================

async function readJSON(file) {
    try {
        const data = await fs.readFile(file, 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function writeJSON(file, data) {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// ============================================
// ========== ПОЛЬЗОВАТЕЛИ (users) ===========
// ============================================

app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }
    
    const users = await readJSON(USERS_FILE);
    
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'Email уже используется' });
    }
    
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        avatar: '',
        bio: '',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    await writeJSON(USERS_FILE, users);
    
    res.status(201).json({ 
        message: 'Пользователь создан',
        user: { id: newUser.id, name, email }
    });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    
    res.json({ 
        message: 'Успешный вход',
        user: { id: user.id, name: user.name, email: user.email }
    });
});

app.get('/api/users', async (req, res) => {
    const users = await readJSON(USERS_FILE);
    res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email, avatar: u.avatar })));
});

app.get('/api/users/:id', async (req, res) => {
    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    
    res.json({ id: user.id, name: user.name, email: user.email, avatar: user.avatar, bio: user.bio });
});

// ============================================
// ============== ПОСТЫ (posts) ===============
// ============================================

app.get('/api/posts', async (req, res) => {
    const posts = await readJSON(POSTS_FILE);
    res.json(posts);
});

app.post('/api/posts', async (req, res) => {
    const { userId, text, image } = req.body;
    
    if (!userId || !text) {
        return res.status(400).json({ error: 'userId и text обязательны' });
    }
    
    const posts = await readJSON(POSTS_FILE);
    const newPost = {
        id: Date.now().toString(),
        userId,
        text,
        image: image || '',
        date: new Date().toISOString(),
        likes: [],
        comments: []
    };
    
    posts.unshift(newPost);
    await writeJSON(POSTS_FILE, posts);
    res.status(201).json(newPost);
});

app.post('/api/posts/:id/like', async (req, res) => {
    const { userId } = req.body;
    const posts = await readJSON(POSTS_FILE);
    const post = posts.find(p => p.id === req.params.id);
    
    if (!post) return res.status(404).json({ error: 'Пост не найден' });
    
    if (post.likes.includes(userId)) {
        post.likes = post.likes.filter(id => id !== userId);
    } else {
        post.likes.push(userId);
    }
    
    await writeJSON(POSTS_FILE, posts);
    res.json({ likes: post.likes });
});

// ============================================
// ============== ГРУППЫ (groups) =============
// ============================================

app.get('/api/groups', async (req, res) => {
    const groups = await readJSON(GROUPS_FILE);
    res.json(groups);
});

app.get('/api/groups/:id', async (req, res) => {
    const groups = await readJSON(GROUPS_FILE);
    const group = groups.find(g => g.id === req.params.id);
    group ? res.json(group) : res.status(404).json({ error: 'Группа не найдена' });
});

app.post('/api/groups', async (req, res) => {
    const { name, description, creatorId } = req.body;
    
    if (!name || !creatorId) {
        return res.status(400).json({ error: 'Название и создатель обязательны' });
    }
    
    const groups = await readJSON(GROUPS_FILE);
    const newGroup = {
        id: Date.now().toString(),
        name,
        description: description || '',
        creatorId,
        members: [creatorId],
        createdAt: new Date().toISOString(),
        avatar: ''
    };
    
    groups.push(newGroup);
    await writeJSON(GROUPS_FILE, groups);
    res.status(201).json(newGroup);
});

app.post('/api/groups/:id/join', async (req, res) => {
    const { userId } = req.body;
    const groups = await readJSON(GROUPS_FILE);
    const group = groups.find(g => g.id === req.params.id);
    
    if (!group) return res.status(404).json({ error: 'Группа не найдена' });
    
    if (!group.members.includes(userId)) {
        group.members.push(userId);
        await writeJSON(GROUPS_FILE, groups);
    }
    
    res.json({ members: group.members });
});

// ============================================
// ========== РУКОВОДСТВА (manuals) ===========
// ============================================

app.get('/api/manuals', async (req, res) => {
    const manuals = await readJSON(MANUALS_FILE);
    res.json(manuals);
});

app.get('/api/manuals/:id', async (req, res) => {
    const manuals = await readJSON(MANUALS_FILE);
    const manual = manuals.find(m => m.id === req.params.id);
    manual ? res.json(manual) : res.status(404).json({ error: 'Руководство не найдено' });
});

app.post('/api/manuals', async (req, res) => {
    const { title, content, authorId, category } = req.body;
    
    if (!title || !content || !authorId) {
        return res.status(400).json({ error: 'Заполните обязательные поля' });
    }
    
    const manuals = await readJSON(MANUALS_FILE);
    const newManual = {
        id: Date.now().toString(),
        title,
        content,
        authorId,
        category: category || 'общее',
        createdAt: new Date().toISOString(),
        views: 0
    };
    
    manuals.push(newManual);
    await writeJSON(MANUALS_FILE, manuals);
    res.status(201).json(newManual);
});

app.put('/api/manuals/:id', async (req, res) => {
    const manuals = await readJSON(MANUALS_FILE);
    const index = manuals.findIndex(m => m.id === req.params.id);
    
    if (index === -1) return res.status(404).json({ error: 'Руководство не найдено' });
    
    manuals[index] = { ...manuals[index], ...req.body };
    await writeJSON(MANUALS_FILE, manuals);
    res.json(manuals[index]);
});

// ============================================
// ============ СООБЩЕНИЯ (messages) ==========
// ============================================

app.get('/api/messages', async (req, res) => {
    const messages = await readJSON(MESSAGES_FILE);
    res.json(messages);
});

app.get('/api/messages/:userId1/:userId2', async (req, res) => {
    const messages = await readJSON(MESSAGES_FILE);
    const chat = messages.filter(m => 
        (m.fromUserId === req.params.userId1 && m.toUserId === req.params.userId2) ||
        (m.fromUserId === req.params.userId2 && m.toUserId === req.params.userId1)
    ).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json(chat);
});

app.post('/api/messages', async (req, res) => {
    const { fromUserId, toUserId, text } = req.body;
    
    if (!fromUserId || !toUserId || !text) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }
    
    const messages = await readJSON(MESSAGES_FILE);
    const newMessage = {
        id: Date.now().toString(),
        fromUserId,
        toUserId,
        text,
        date: new Date().toISOString(),
        read: false
    };
    
    messages.push(newMessage);
    await writeJSON(MESSAGES_FILE, messages);
    res.status(201).json(newMessage);
});

app.put('/api/messages/:id/read', async (req, res) => {
    const messages = await readJSON(MESSAGES_FILE);
    const message = messages.find(m => m.id === req.params.id);
    
    if (!message) return res.status(404).json({ error: 'Сообщение не найдено' });
    
    message.read = true;
    await writeJSON(MESSAGES_FILE, messages);
    res.json({ read: true });
});

// ============================================
// ============== РАБОТА (work) ===============
// ============================================

app.get('/api/work', async (req, res) => {
    const work = await readJSON(WORK_FILE);
    res.json(work);
});

app.get('/api/work/:id', async (req, res) => {
    const work = await readJSON(WORK_FILE);
    const item = work.find(w => w.id === req.params.id);
    item ? res.json(item) : res.status(404).json({ error: 'Запись не найдена' });
});

app.post('/api/work', async (req, res) => {
    const { title, description, authorId, status, priority } = req.body;
    
    if (!title || !authorId) {
        return res.status(400).json({ error: 'Название и автор обязательны' });
    }
    
    const work = await readJSON(WORK_FILE);
    const newItem = {
        id: Date.now().toString(),
        title,
        description: description || '',
        authorId,
        status: status || 'новая',
        priority: priority || 'средний',
        createdAt: new Date().toISOString(),
        deadline: null,
        assignedTo: []
    };
    
    work.push(newItem);
    await writeJSON(WORK_FILE, work);
    res.status(201).json(newItem);
});

app.put('/api/work/:id', async (req, res) => {
    const work = await readJSON(WORK_FILE);
    const index = work.findIndex(w => w.id === req.params.id);
    
    if (index === -1) return res.status(404).json({ error: 'Запись не найдена' });
    
    work[index] = { ...work[index], ...req.body };
    await writeJSON(WORK_FILE, work);
    res.json(work[index]);
});

app.delete('/api/work/:id', async (req, res) => {
    const work = await readJSON(WORK_FILE);
    const newWork = work.filter(w => w.id !== req.params.id);
    
    if (work.length === newWork.length) {
        return res.status(404).json({ error: 'Запись не найдена' });
    }
    
    await writeJSON(WORK_FILE, newWork);
    res.json({ message: 'Удалено' });
});

// ============================================
// ========== СТАТИСТИКА (общая) ==============
// ============================================

app.get('/api/stats', async (req, res) => {
    const users = await readJSON(USERS_FILE);
    const posts = await readJSON(POSTS_FILE);
    const groups = await readJSON(GROUPS_FILE);
    const messages = await readJSON(MESSAGES_FILE);
    const work = await readJSON(WORK_FILE);
    
    res.json({
        users: users.length,
        posts: posts.length,
        groups: groups.length,
        messages: messages.length,
        work: work.length
    });
});

// ============================================
// ============== ЗАПУСК СЕРВЕРА ==============
// ============================================

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📁 Файлы:`);
    console.log(`   - users.json`);
    console.log(`   - posts.json`);
    console.log(`   - groups.json`);
    console.log(`   - manuals.json`);
    console.log(`   - messages.json`);
    console.log(`   - work.json`);
});