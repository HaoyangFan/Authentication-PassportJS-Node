'use strict';

function isLoggedIn(req, res, next) {
    // check the status of request, if it is unauthenticated, then direct it
    // back to the login page (home page)
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    // else, continue to the next middleware function
    return next();
}

module.exports = (app, passport) => {
    // routing for the login page (default as the index page)
    app.route('/')
        .get((req, res) => {
            console.log(req.flash('error'));
            res.render('login', {
                pageTitle: 'Log In',
            });
        })
        .post(
            passport.authenticate('local-login', {
                failureRedirect: '/',
                successRedirect: '/profile',
                failureFlash: true,
                successFlash: 'Welcome!',
            })
        );

    // routing for the signup page
    app.route('/signup')
        .get((req, res) => {
            console.log(req.flash('error'));
            res.render('signup', {
                pageTitle: 'Sign Up',
            });
        })
        .post(
            passport.authenticate('local-signup', {
                failureRedirect: '/signup',
                successRedirect: '/profile',
                failureFlash: true,
                successFlash: 'Welcome!',
            })
        );

    app.route('/profile').get(isLoggedIn, (req, res) => {
        console.log(req.flash('success'));
        console.log(req.session);
        res.render('profile', {
            user: req.user,
        });
    });
};
