const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) throw new Error('Missing JWT_SECRET environment variable');
const token = jwt.sign({ id: 2, role: 'user' }, process.env.JWT_SECRET);
fetch('http://localhost:3000/api/users/me', { headers: { Authorization: 'Bearer ' + token } })
    .then(async response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const user = await response.json();
        console.log('Profile ok:', { id: user.id, name: user.name, email: user.email });
    })
    .catch(err => { console.error('Lỗi:', err.message); process.exitCode = 1; });
