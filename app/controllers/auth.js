module.exports.controller = function (app) {
    /**
     * Module dependencies.
     */
    var passport = require('passport'),
        passportGithub = require('passport-github'),
        passportLocal = require('passport-local'),
        user = require('../models/user.js');
    /**
     * Production Github Application.
     */
    var githubProduction = {
        clientID: '4e19f045b5dbe86fcc6e',
        clientSecret: 'a21ca6f13a8a4e4575bf4579a8c317663880f685',
        callbackURL: 'http://hapi.co/auth/github/callback'
    };
    /**
     * Development Github Application.
     */
    var githubDevelopment = {
        clientID: '87bb75f0ddb11a79ff68',
        clientSecret: '7446b289245f51055b547af24fcb4b8ccdb50d9f',
        callbackURL: 'http://0.0.0.0:8080/auth/github/callback'
    };
    /**
     * Configure Passport.
     */
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function (id, done) {
        user.findOne({ _id: id }, function (err, user) {
            done(err, user);
        });
    });
    passport.use(new passportLocal.Strategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function (email, password, done) {
            user.isValidUserPassword(email, password, done);
        }
    ));
    passport.use(new passportGithub.Strategy(githubDevelopment, function (accessToken, refreshToken, profile, done) {
            profile.authOrigin = 'github';
            user.findOrCreateOAuthUser(profile, function (err, user) {
                return done(err, user);
            });
        }
    ));

    app
        .get('/auth/github', passport.authenticate('github', {
            scope: 'email'
        }))
        .get('/auth/github/callback', passport.authenticate('github', {
            successRedirect: '/dash',
            failureRedirect: '/'
        }))
        .post('/signin', passport.authenticate('local', {
            successRedirect: '/dash',
            failureRedirect: '/'
        }))
        .get('/logout', function (req, res, next) {
            req.logout();
            res.redirect('/');
        })
        .post('/signup', function (req, res, next) {
            user.count({
                email: req.body.email
            }, function (err, count) {
                if (count === 0) {
                    user.signup(req.body.email, req.body.password, function (err, user) {
                        if (err) {
                            throw err;
                        }
                        req.login(user, function (err) {
                            if (err) {
                                return next(err);
                            }
                            return res.redirect('/dash');
                        });
                    });
                } else {
                    res.redirect('/');
                }
            });
        });
};
