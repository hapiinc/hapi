module.exports.controller = function (app) {
    var title = 'Hapi',
        author = 'Tony Tahmouch tony@hapi.co',
        copyright = 'Copyright © 2014 Hapi, Inc.',
        description = 'Hapi Homepage.',
        keywords = 'hypermedia, api, rest, restful, javascript, node, node.js, web, docker';
    app
        .get('/', function (req, res, next) {
            if (req.isAuthenticated()) {
                res.redirect('/dash');
            } else {
                res.render('home.html', {
                    layout: false,
                    title: title,
                    author: author,
                    copyright: copyright,
                    description: description,
                    keywords: keywords
                });
            }
        });
};
