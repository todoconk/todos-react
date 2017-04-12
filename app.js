var express = require('express'),
    config = require('./config'),
    http = require('http'),
    app = express(),
    server,
    routes;

var port = 8080;

server = http.createServer(app);
config(app);

routes = [
    './apps/web/routes',
    './apps/todos/routes'
];

routes.forEach(function(path) {
    require(path)(app);
});

server.listen(port, function(err) {
    if (err) {
        console.error('Unable to listen for connections', err);
        process.exit(1);
    }

    console.log('running on port', port);
});


