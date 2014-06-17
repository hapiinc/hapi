module.exports.controller = function (app) {
    /**
     * Module Dependencies.
     */
    var user = require('../models/user.js'),
        docker = require('../docker.js'),
        title = 'Dashboard',
        author = 'Tony Tahmouch tony@hapi.co',
        copyright = 'Copyright © 2014 Hapi, Inc.',
        description = 'Hapi Dashboard.',
        keywords = 'hypermedia, api, rest, restful, javascript, node, node.js, web, docker';

    app
        .post('/dash', function (req, res, next) {
            if (req.isAuthenticated()) {
                var redirect = true;
                if (!!req.body && typeof req.body === 'object') {
                    switch (req.body.action) {
                        case 'manage':
                            redirect = false;
                            user.getHapiById({ email: req.user.email }, req.body.hapi, function (err, hapi) {
                                if (!!hapi) {
                                    docker.inspectContainer('/var/docker.sock', hapi.id, function (container) {
                                        res.render('dash.html', {
                                            layout: false,
                                            title: title,
                                            author: author,
                                            copyright: copyright,
                                            description: description,
                                            keywords: keywords,
                                            hapi: hapi,
                                            running: !!container ? container.State.Running : null
                                        });
                                    });
                                } else {
                                    res.redirect('/dash');
                                }
                            });
                            break;
                        case 'create':
                            redirect = false;
                            res.render('dash.html', {
                                layout: false,
                                title: title,
                                author: author,
                                copyright: copyright,
                                description: description,
                                keywords: keywords,
                                hapis: []
                            });
                            break;
                        default:
                            break;
                    }
                }
                if (redirect) {
                    res.redirect('/dash');
                }
            } else {
                res.redirect('/');
            }
        })
        .get('/dash', function (req, res, next) {
            if (req.isAuthenticated()) {
                user.getHapis({ email: req.user.email }, function (err, hapis) {
                    res.render('dash.html', {
                        layout: false,
                        title: title,
                        author: author,
                        copyright: copyright,
                        description: description,
                        keywords: keywords,
                        hapis: !!hapis ? hapis : []
                    });
                });
            } else {
                res.redirect('/');
            }
        });
};
