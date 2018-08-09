// configure the local strategy of passport js
'use strict';
const localStrategy = require('passport-local');
const bcrypt = require('bcrypt');
// use the database API
const { addNewUser, findByUsername } = require('../db');
const saltRounds = 8;

module.exports = passport => {
    // serialize the username of user (can later be used to find that user from db) into session
    passport.serializeUser(function(user, done) {
        // the username of user
        return done(null, user.username);
    });

    passport.deserializeUser(function(username, done) {
        findByUsername(username).then(res => {
            // in case there is no such user with the given username, the rows
            // wrapped in the res object will be empty
            if (res.rows.length === 0) {
                return done(
                    new Error(
                        `no such user with username ${username} exists in db`
                    ),
                    undefined
                );
            }
            // create the user object
            let user = res.rows[0];
            // the newly created user object will be restored to req.user so that
            // we can access it later
            return done(null, user);
        });
    });

    // define the local strategy used for sign up
    passport.use(
        // name of this strategy
        'local-signup',
        new localStrategy(
            {
                // IMPORTANT: this allows us to get all data user entered
                // no longer limits to the email and password only
                // see: https://github.com/jaredhanson/passport-local
                passReqToCallback: true,
            },
            function(req, u, p, done) {
                let {
                    username,
                    email,
                    firstname,
                    lastname,
                    password,
                } = req.body;
                // salt and hash the passwords
                bcrypt
                    .hash(password, saltRounds)
                    .then(pwdhash => {
                        addNewUser(
                            username,
                            pwdhash,
                            email,
                            firstname,
                            lastname
                        )
                            .then(res => {
                                // use the first object(and should be the only one) in res.rows array
                                // as the user object
                                return done(null, res.rows[0]);
                            })
                            .catch(err => {
                                // if the err has "name" property whose value is "error",
                                // then the error is due to Postgres, which is probably
                                // because the username or password has already been taken by others
                                if (err.name === 'error') {
                                    if (err.message.includes('email')) {
                                        return done(null, false, {
                                            message: `email ${email} has already been taken`,
                                        });
                                    } else if (
                                        err.message.includes('username')
                                    ) {
                                        return done(null, false, {
                                            message: `username ${username} has already been taken`,
                                        });
                                    } else {
                                        return done(null, false, {
                                            message:
                                                'sign up fails, please try again',
                                        });
                                    }
                                } else {
                                    // indicate that the error is probably due to server exception,
                                    // db connection failure etc
                                    return done(err);
                                }
                            });
                    })
                    .catch(err => {
                        // in case there are some errors in hashing the password
                        return done(err);
                    });
            }
        )
    );

    passport.use(
        'local-login',
        new localStrategy(
            {
                usernameField: 'username',
                passwordField: 'password',
            },
            function(username, password, done) {
                // load the password hash that is assoicated with this username
                findByUsername(username)
                    .then(res => {
                        // if there is no such username, then the login shall be failed
                        if (res.rows.length === 0) {
                            return done(null, false, {
                                message: `user "${username}" does not exist`,
                            });
                        }
                        bcrypt
                            .compare(password, res.rows[0].pwdhash)
                            .then(compRes => {
                                if (compRes) {
                                    // if the comparison result is true, the login is successful
                                    return done(null, res.rows[0]);
                                }
                                // otherwise, the login is failed
                                return done(null, false, {
                                    message: 'the password is not correct',
                                });
                            })
                            .catch(err => {
                                // in case some exceptions occur in bcrypt
                                return done(err);
                            });
                    })
                    .catch(err => {
                        // in case some exceptions occur with connection to the database
                        return done(err);
                    });
            }
        )
    );
};
