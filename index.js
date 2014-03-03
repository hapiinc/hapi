#!/usr/bin/env node

/**
 * Falsy Values: false, 0, "", null, undefined, NaN
 */

(function () {
    /**
     * Module dependencies.
     */
    var http = require('http'),
        path = require('path'),
        flash = require('connect-flash'),
        express = require('express'),
        mongoose = require('mongoose'),
        passport = require('passport'),
        passportGithub = require('passport-github'),
        passportLocal = require('passport-local'),
        xop = require('xop'),
        models = require('./app/models'),
        controllers = require('./app/controllers');

    /**
     * Process.argv will be an array.
     * Array:
     *  1st element will be 'node'
     *  2nd element will be '/path/to/this/JavaScript/file'
     *  3rd - Nth elements will be additional command line arguments
     *
     * Introspect Node arguments vector for:
     * - optional port to begin accepting connections
     * - optional host to begin accepting connections
     * - optional database port to connect to
     * - optional database host to connect to
     * - optional HTTP router library
     *
     * Options.get() values may yield:
     * - {undefined}
     * - {boolean} true
     * - {string} (non-empty)
     *
     * Options.has() values may yield:
     * - {boolean} true
     * - {boolean} false
     */
    var options = xop().parse(process.argv),
        port = options.get('port'),
        host = options.get('host'),
        databasePort = options.get('dbport'),
        databaseHost = options.get('dbhost'),
        lib = options.get('lib'),
        debug = options.has('debug');

    /**
     * Default the Port and Host values if they're not defined.
     */
    port = (typeof port === 'string' && Number(port) >= 0) ? port : '8080';
    host = (typeof host === 'string') ? host : '0.0.0.0';
    databasePort = (typeof databasePort === 'string' && Number(databasePort) >= 0) ? databasePort : '27017';
    databaseHost = (typeof databaseHost === 'string') ? databaseHost : '127.0.0.1';

    if (debug) {
        console.log('------------------------------');
        console.log('Incoming Option Values.');
        console.log('Port: ' + JSON.stringify(port));
        console.log('Host: ' + JSON.stringify(host));
        console.log('Database Port: ' + JSON.stringify(databasePort));
        console.log('Database Host: ' + JSON.stringify(databaseHost));
        console.log('Lib: ' + JSON.stringify(lib));
        console.log('------------------------------');
    }

    /**
     * Connect to Database.
     * TODO: Consider abstracting this piece to all for other database types.
     */
    mongoose.connect('mongodb://' + databaseHost + ':' + databasePort + '/hapi');

    /**
     * If there is a connection error, then log it.
     * If connected, then proceed with running the HTTP Server.
     */
    mongoose.connection
        .on('error', function (error) {
            console.log('------------------------------');
            console.log('Failed to connect to database.');
            console.log('Host:' + databaseHost);
            console.log('Port:' + databasePort);
            console.log('Server NOT running.');
            console.log('Host:' + host);
            console.log('Port:' + port);
            console.log('------------------------------');
        })
        .once('open', function () {
            /**
             * Create an Express Router.
             */
            var app = express();

            /**
             * Configure Passport.
             */
            passport.serializeUser(function (user, done) {
                done(null, user.id);
            });
            passport.deserializeUser(function (id, done) {
                models.user.findOne({ _id: id }, function (err, user) {
                    done(err, user);
                });
            });
            passport.use(
                new passportLocal.Strategy(
                    {
                        usernameField: 'email',
                        passwordField: 'password'
                    }, function (email, password, done) {
                        models.user.isValidUserPassword(email, password, done);
                    }
                )
            );
            passport.use(
                new passportGithub.Strategy(
                    {
                        clientID: '4e19f045b5dbe86fcc6e',
                        clientSecret: 'a21ca6f13a8a4e4575bf4579a8c317663880f685',
                        callbackURL: 'http://hapi.co/auth/github/callback'
                    },
                    function (accessToken, refreshToken, profile, done) {
                        profile.authOrigin = 'github';
                        models.user.findOrCreateOAuthUser(profile, function (err, user) {
                            return done(err, user);
                        });
                    }
                )
            );

            /**
             * Create an HTTP Server with the Express Router as the Request Handler.
             * Listen on port 8080.
             */
            http
                .createServer(
                    app
                        .set('views', path.join(__dirname, 'app/views'))
                        .set('view engine', 'jade')
                        .use(express.favicon())
                        .use(express.logger('dev'))
                        .use(express.cookieParser())
                        .use(express.urlencoded())
                        .use(express.json())
                        .use(express.session({ secret: 'keyboard cat' }))
                        .use(passport.initialize())
                        .use(passport.session())
                        .use(express.methodOverride())
                        .use(flash())
                        .use(app.router)
                        .use(express.static(path.join(__dirname, 'app/statics')))
                        .use(express.errorHandler())
                        .get('/', controllers.entry.get)
                        .get('/login', controllers.login.get)
                        .post('/login', controllers.login.post)
                        .get('/signup', controllers.signup.get)
                        .post('/signup', controllers.signup.post, controllers.signup.postTwo)
                        .get('/auth/github', controllers.github.get)
                        .get('/auth/github/callback', controllers.github.callback)
                        .get('/profile', controllers.profile.get, controllers.profile.getTwo)
                        .get('/logout', controllers.logout.get)
                        .use(controllers.error.server)
                        .use(controllers.error.client)
                )
                .listen(port, host, function () {
                    console.log('------------------------------');
                    console.log('Database connected.');
                    console.log('Host:' + databaseHost);
                    console.log('Port:' + databasePort);
                    console.log('Server running.');
                    console.log('Host:' + host);
                    console.log('Port:' + port);
                    console.log('------------------------------');
                });
        });
})();
