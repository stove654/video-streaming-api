var express = require('express');
var app = express();
var morgan = require('morgan');
var mongoose = require('mongoose');
var config = require('./config/config');
var path = require('path');

// set port
var port = process.env.PORT || 8080;

// Connect to database
mongoose.connect(config.database);

var server = require('http').createServer(app);

var socketio = require('socket.io')(server, {
    path: '/socket.io-client'
});
require('./config/socketio')(socketio, app);

// use morgan to log requests to the console
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

require('./config/express')(app);
require('./routes')(app);

app.get('/', function(request, response) {
    response.send('Hello World!');
});

app.post('/api/webrtcs', function (req, res, next) {
    socketio.sockets.emit('webrtc:save', req.body);
    res.json(201, req.body);
    next();
});

server.listen(port, function () {
    console.log('Viber server listening on port: ', port);
});

