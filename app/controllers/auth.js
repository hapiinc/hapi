module.exports.controller = function (app) {
    /**
     * Module Dependencies.
     */
    var passport = require('passport'),
        passportGithub = require('passport-github'),
        passportLocal = require('passport-local'),
        user = require('../models/user.js');

    /**
     * Check Environment and Configure Passport.
     */
    var environment = app.get('environment'),
        isDevEnvironment = environment === 'development';

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
    passport.use(new passportGithub.Strategy({
            clientID: isDevEnvironment ? '87bb75f0ddb11a79ff68' : '4e19f045b5dbe86fcc6e',
            clientSecret: isDevEnvironment
                ? '7446b289245f51055b547af24fcb4b8ccdb50d9f'
                : 'a21ca6f13a8a4e4575bf4579a8c317663880f685',
            callbackURL: isDevEnvironment ? 'http://0.0.0.0:8080/auth/github' : 'http://hapi.co/auth/github'
        }, function (accessToken, refreshToken, profile, done) {
            profile.authOrigin = 'github';
            user.findOrCreateOAuthUser(profile, function (err, user) {
                return done(err, user);
            });
        }
    ));

    var githubAuthentication = passport.authenticate('github', { scope: 'email' }),
        localAuthentication = passport.authenticate('local', { successRedirect: '/dash', failureRedirect: '/' });

    app
        .get('/auth/github', passport.authenticate('github', {
            successRedirect: '/dash',
            failureRedirect: '/'
        }))
        .post('/auth', function (req, res, next) {
            if (!!req.body && typeof req.body === 'object') {
                var action = req.body.action,
                    email = req.body.email,
                    password = req.body.password;

                console.log(action);
                console.log(email);
                console.log(password);

                switch (action) {
                    case 'login':
                        localAuthentication(req, res, next);
                        break;
                    case 'register':
                        user.count({
                            email: email
                        }, function (err, count) {
                            if (count === 0) {
                                user.signup(email, password, function (err, user) {
                                    if (err) {
                                        return next(err);
                                    }
                                    req.login(user, function (err) {
                                        if (err) {
                                            return next(err);
                                        }
                                        return res.redirect('/dash');
                                    });
                                });
                            } else {
                                return res.redirect('/');
                            }
                        });
                        break;
                    case 'github':
                        githubAuthentication(req, res, next);
                        break;
                    case 'logout':
                        req.logout();
                        res.redirect('/');
                        break;
                    default:
                        res.redirect('/dash');
                        break;
                }
            } else {
                res.redirect('/dash');
            }
        });
};
