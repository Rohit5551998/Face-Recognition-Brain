const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

const database = {
    users: [
        {
            id: '123',
            name: 'John',
            email: 'john@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Sally',
            email: 'sally@gmail.com',
            password: 'bananas',
            entries: 0,
            joined: new Date()
        }
    ],
    login: [
        {
            id: '987',
            hash: '',
            email: 'john@gmail.com'
        }
    ]
}

app.get('/', (req, res) => {
    res.send(database.users);
});

app.post('/signin', (req, res) => {
    // Load hash from your password DB.
    bcrypt.compare("apples", "$2a$10$85QlWp.58Ka0BQzuaAGnVORr0Sr9IPdVXKyU20ISMUxcI6W5Yz6Na", function (err, res) {
        // res == true
    });
    bcrypt.compare("veggies", "$2a$10$85QlWp.58Ka0BQzuaAGnVORr0Sr9IPdVXKyU20ISMUxcI6W5Yz6Na", function (err, res) {
        // res = false
    });
    if (req.body.email === database.users[0].email && req.body.password === database.users[0].password) {
        res.json(database.users[0]);
    } else {
        res.status(400).json('error logging in');
    }
});

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    bcrypt.hash("bacon", null, null, function (err, hash) {
        // Store hash in your password DB.
        console.log(hash)
    });
    database.users.push({
        id: '125',
        name: name,
        email: email,
        // password: password,
        entries: 0,
        joined: new Date()
    })
    res.json(database.users[database.users.length - 1]);
});

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    let found = false;
    database.users.forEach(user => {
        if (user.id === id) {
            found = true;
            return res.json(user);
        }
    })
    if (!found) {
        res.status(400).json('Not Found');
    }
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    let found = false;
    database.users.forEach(user => {
        if (user.id === id) {
            found = true;
            user.entries++;
            return res.json(user.entries);
        }
    })
    if (!found) {
        res.status(400).json('Not Found');
    }
});

app.listen(3001, () => {
    console.log('App is running on port 3001');
});

