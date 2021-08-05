const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'Rohit',
        password: 'root',
        database: 'smart-brain'
    }
});

// db.select('*').from('users').then(data => {
//     console.log(data);
// });


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
    db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
            if (isValid) {
                return db.select('*').from('users')
                    .where('email', '=', req.body.email)
                    .then(user => {
                        res.json(user[0])
                    })
                    .catch(err => res.status(400).json('Unable to get user'))
            } else {
                res.status(400).json('Wrong Credentials')
            }
        })
        .catch(err => res.status(400).json('Wrong Credentials'))
    // if (req.body.email === database.users[0].email && req.body.password === database.users[0].password) {
    //     res.json(database.users[0]);
    // } else {
    //     res.status(400).json('error logging in');
    // }
});

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    // bcrypt.hash("bacon", null, null, function (err, hash) {
    //     // Store hash in your password DB.
    //     console.log(hash)
    // });
    // database.users.push({
    //     id: '125',
    //     name: name,
    //     email: email,
    //     // password: password,
    //     entries: 0,
    //     joined: new Date()
    // })

    const hash = bcrypt.hashSync(password);

    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                    .returning('*')
                    .insert({
                        email: loginEmail[0],
                        name: name,
                        joined: new Date()
                    })
                    .then(user => {
                        res.json(user[0]);
                    })

            })
            .then(trx.commit)
            .catch(trx.rollback)
    })
        .catch(err => res.status(400).json('Unable To Register'));

});

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    db.select('*').from('users')
        .where({ id })
        .then(user => {
            if (user.length) {
                res.json(user[0]);
            } else {
                res.status(400).json('Not Found');
            }
        })
        .catch(err => res.status(400).json('Error getting user'));
    // database.users.forEach(user => {
    //     if (user.id === id) {
    //         return res.json(user);
    //     }
    // })
    // if (!found) {
    //     res.status(400).json('Not Found');
    // }
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            res.json(entries[0]);
        })
        .catch(err => res.status(400).json('Unable to get Entries'));
    // let found = false;
    // database.users.forEach(user => {
    //     if (user.id === id) {
    //         found = true;
    //         user.entries++;
    //         return res.json(user.entries);
    //     }
    // })
    // if (!found) {
    //     res.status(400).json('Not Found');
    // }
});

app.listen(3001, () => {
    console.log('App is running on port 3001');
});

