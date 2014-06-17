module.exports.controller = function (app) {
    /**
     * Module Dependencies.
     */
    var user = require('../models/user.js'),
        docker = require('../docker.js');

    /**
     * Docker Configurations for Hapi Container Creation and Initialization.
     */
    var containerConfig = {
            "Hostname": "",
            "Domainname": "",
            "User": "",
            "Memory": 0,
            "MemorySwap": 0,
            "CpuShares": 0,
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "PortSpecs": null,
            "ExposedPorts": {
                "22/tcp": {},
                "80/tcp": {},
                "8080/tcp": {}
            },
            "Tty": false,
            "OpenStdin": false,
            "StdinOnce": false,
            "Env": [
                "HOME=/root",
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
            ],
            "Cmd": [
                "/usr/bin/supervisord"
            ],
            "Image": "paasta/hapi",
            "Volumes": null,
            "WorkingDir": "",
            "Entrypoint": null,
            "NetworkDisabled": false,
            "OnBuild": null
        },
        hostConfig = {
            "Binds": null,
            "ContainerIDFile": "",
            "LxcConf": [],
            "Privileged": false,
            "PortBindings": {
                "22/tcp": null,
                "80/tcp": null,
                "8080/tcp": null
            },
            "Links": null,
            "PublishAllPorts": false,
            "Dns": null,
            "DnsSearch": null,
            "VolumesFrom": null
        },
        socket = '/var/docker.sock';
    /**
     * Valid Container Name Regular Expression.
     * Example: www.hapi.co, bitcoin.hapi.co
     */
    var validContainerName = /^[a-zA-Z0-9](?:([a-zA-Z0-9\-])*[a-zA-Z0-9])?\.hapi\.co$/;

    app
        .post('/containers', function (req, res, next) {
            var redirect = true;
            if (req.isAuthenticated() && !!req.body && typeof req.body === 'object') {
                var action = req.body.action,
                    hapi = req.body.hapi,
                    email = req.user.email;

                if (!!hapi && typeof hapi === 'string') {
                    switch (action) {
                        case 'create':
                            if (validContainerName.test(hapi)) {
                                redirect = false;
                                docker.createContainer(socket, containerConfig, hapi, function (container) {
                                    if (!!container) {
                                        var id = container.Id;
                                        user.addHapi({ email: email }, { 'id': id, 'name': hapi },
                                            function (err, hapi) {
                                                res.redirect('/dash');
                                                console.log(err);
                                                console.log(hapi);
                                            }
                                        );
                                        docker.startContainer(socket, id, hostConfig, function (started) {
                                            console.log(started);
                                        });
                                    } else {
                                        res.redirect('/dash');
                                    }
                                    console.log(container);
                                });
                            }
                            break;
                        case 'manage':
                            break;
                        case 'start':
                            docker.startContainer(socket, hapi, hostConfig, function (started) {
                                console.log(started);
                            });
                            break;
                        case 'code':
                            redirect = false;
                            user.getHapiById({ email: email }, hapi, function (err, hapi) {
                                if (!!hapi) {
                                    res.redirect('http://ide.' + hapi.name);
                                } else {
                                    res.redirect('/dash');
                                }
                            });
                            break;
                        case 'browse':
//                            redirect = false;
                            break;
                        case 'stop':
                            docker.stopContainer(socket, hapi, function (stopped) {
                                console.log(stopped);
                            });
                            break;
                        case 'restart':
                            docker.restartContainer(socket, hapi, function (restarted) {
                                console.log(restarted);
                            });
                            break;
                        case 'remove':
                            redirect = false;
                            docker.removeContainer(socket, hapi, function (removed) {
                                if (!!removed) {
                                    user.removeHapi({ email: email }, { 'id': hapi }, function (err, hapi) {
                                        res.redirect('/dash');
                                        console.log(err);
                                        console.log(hapi);
                                    });
                                } else {
                                    res.redirect('/dash');
                                }
                                console.log(removed);
                            });
                            break;
                        default:
                            break;
                    }
                    console.log(action);
                    console.log(hapi);
                }
            }
            if (redirect) {
                res.redirect('/dash');
            }
        });
};
