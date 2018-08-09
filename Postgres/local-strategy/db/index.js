'use strict';
// load the pool functionality from pg
const { Pool } = require('pg');

// load the .env file
if (require('dotenv').config().error) {
    console.error('failed to load env file');
    process.exit(1);
}

// configuration for the pool
// connection string might be used when the NODE_ENV is production
const config =
    process.env.NODE_ENV === 'production'
        ? {
            connectionString: process.env.CONNECTIONSTRING,
        }
        : {
            // number of milliseconds to wait before timing out when connecting a new client
            // by default this is 0 which means no timeout
            connectionTImeoutMillis: 5e3,
            // number of milliseconds a client must sit idle in the pool and not be checked out
            // before it is disconnected from the backend and discarded
            // default is 10000 (10 seconds) - set to 0 to disable auto-disconnection of idle clients
            idleTimeoutMillis: 1e4,
            // maximum number of clients the pool should contain
            // by default this is set to 10.
            max: 100,
        };

// exports the connection pool
let pool = new Pool(config);

// API for adding a new user to the database
module.exports.addNewUser = (username, pwdhash, email, firstname, lastname) => {
    return pool.query(
        'INSERT INTO users (username, pwdhash, email, firstname, lastname) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [username, pwdhash, email || null, firstname || null, lastname || null]
    );
};

// API for finding a existing user based on the username attribute
module.exports.findByUsername = username => {
    return pool.query('SELECT * FROM users WHERE username = $1', [username]);
};

// API for loading the password hash from the database, given a particular username
module.exports.loadPasswordHash = username => {
    return pool.query('SELECT pwdhash FROM users WHERE username = $1', [
        username,
    ]);
};

// c('hafan4556')
//     .then(res => console.log(res.rows))
//     .catch(err => console.error('err:', err));

// a('1', '1', '', '', '')
//     .then(res => console.log(res.rows))
//     .catch(err => console.error(err.message));
// b('2')
//     .then(res => console.log(res))
//     .catch(err => console.error(err.message));
