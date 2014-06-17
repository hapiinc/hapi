#!/usr/bin/env node

/**
 * Falsy Values: false, 0, "", null, undefined, NaN
 */

(function () {
    /**
     * Module dependencies.
     */
    var fs = require('fs'),
        http = require('http'),
        path = require('path'),
        flash = require('connect-flash'),
        express = require('express'),
        doT = require('express-dot'),
        mongoose = require('mongoose'),
        passport = require('passport'),
        slop = require('slop');

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
     * - optional environment to distinguish between development and production
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
    var options = slop().parse(process.argv),
        port = options.get('port'),
        host = options.get('host'),
        databasePort = options.get('dbport'),
        databaseHost = options.get('dbhost'),
        lib = options.get('lib'),
        environment = options.get('environment'),
        debug = options.has('debug');

    /**
     * Default the Port, Host, and Environment values if they're not defined.
     */
    port = (typeof port === 'string' && Number(port) >= 0) ? port : '8080';
    host = (typeof host === 'string') ? host : '0.0.0.0';
    databasePort = (typeof databasePort === 'string' && Number(databasePort) >= 0) ? databasePort : '27017';
    databaseHost = (typeof databaseHost === 'string') ? databaseHost : '127.0.0.1';
    environment = (typeof environment === 'string') ? environment : 'development';

    if (debug) {
        console.log('------------------------------');
        console.log('Incoming Option Values.');
        console.log('Port: ' + port);
        console.log('Host: ' + host);
        console.log('Database Port: ' + databasePort);
        console.log('Database Host: ' + databaseHost);
        console.log('Lib: ' + lib);
        console.log('Environment', environment);
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
            console.log('------------------------------');
        });

    /**
     * Create an Express Router.
     */
    var app = express(),
        controllersPath = path.join(__dirname, 'app/controllers/');

    /**
     * Create an HTTP Server with the Express Router as the Request Handler.
     * Listen on port 8080.
     */
    http
        .createServer(
            app
                .set('environment', environment)
                .set('views', path.join(__dirname, 'app/views'))
                .set('view engine', 'dot')
                .engine('html', doT.__express)
                .use(express.favicon())
                .use(express.logger('dev'))
                .use(express.cookieParser())
                .use(express.urlencoded())
                .use(express.session({ secret: 'keyboard cat' }))
                .use(passport.initialize())
                .use(passport.session())
                .use(express.methodOverride())
                .use(flash())
                .use(app.router)
                .use(express.static(path.join(__dirname, 'app/statics')))
                .use(express.errorHandler())
                .use(function (err, req, res, next) {
                    res.status(err.status || 500);
                    res.render('home.html', {
                        layout: false,
                        title: 'Hapi',
                        author: 'Tony Tahmouch tony@hapi.co',
                        copyright: 'Copyright © 2014 Hapi, Inc.',
                        description: 'Hapi Homepage.',
                        keywords: 'hypermedia, api, rest, restful, javascript, node, node.js, web, docker'
                    });
                })
                .use(function (req, res, next) {
                    res.status(404);
                    res.render('home.html', {
                        layout: false,
                        title: 'Hapi',
                        author: 'Tony Tahmouch tony@hapi.co',
                        copyright: 'Copyright © 2014 Hapi, Inc.',
                        description: 'Hapi Homepage.',
                        keywords: 'hypermedia, api, rest, restful, javascript, node, node.js, web, docker'
                    });
                })
        )
        .listen(port, host, function () {
            console.log('------------------------------');
            console.log('Server running.');
            console.log('Host:' + host);
            console.log('Port:' + port);
            console.log('------------------------------');
        });

    fs.readdirSync(controllersPath).forEach(function (file) {
        if (file.substr(-3) === '.js') {
            var controllerPath = controllersPath + file,
                route = require(controllerPath);
            route.controller(app);
        }
    });
})();
