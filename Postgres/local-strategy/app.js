'use strict';
// import third-party modules
const morgan = require('morgan');
const express = require('express');
const passport = require('passport');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const session = require('express-session');
// import build-in modules
const fs = require('fs');
const path = require('path');

// load the environment variables
if (require('dotenv').config().error) {
    console.error('failed to load the .env file');
    process.exit(1);
}
// load the PORT number from the environment variables or use 8000 as default
const PORT = process.env.PORT || 8000;
// initialize the express application
let app = express();
// set the template engine to be pug
app.set('view engine', 'pug');
// set the files that are public to others
app.use('/public', express.static(path.join(__dirname, 'public')));
// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'log', 'access.log'),
    {
        // append to the log file
        flags: 'a',
    }
);
// direct all logs to the access.log
app.use(morgan('common', { stream: accessLogStream }));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// use the connect-flash middleware
app.use(flash());
// set the express-session
app.use(
    session({
        cookie: {
            // disable the access of cookie via JS (e.g. document.cookie)
            httpOnly: true,
            // the cookie will be expired in 24 hours
            maxAge: 8.64e7,
        },
        resave: false,
        saveUninitialized: false,
        // randomly generated string of 32 bytes
        secret:
            '\x19\xc6\xe9\xe1\x00I\x9e\xb1\xff\xbac\xd3\xa9\xf4 ~\xabS\xf9\xf6\xedv\xe4\xdaI\x85Q\x03\x99\x1f\xcd\xf5',
    })
);
// initialize the passport
app.use(passport.initialize());
// enable the use of passport-session
app.use(passport.session());
// configure the passport
require('./config')(passport);
// configure the routes
require('./routes')(app, passport);
// make the app listen on the port
app.listen(PORT, () => console.log(`app listens at port ${PORT}`));
