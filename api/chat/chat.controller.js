/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /Chats              ->  index
 * POST    /Chats              ->  create
 * GET     /Chats/:id          ->  show
 * PUT     /Chats/:id          ->  update
 * DELETE  /Chats/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Chat = require('./chat.model');
var Chanel = require('../chanel/chanel.model');
var multer = require('multer');
var config = require('../../config/config.js');
var fs = require('fs');
var mkdirp = require('mkdirp');
var pushbots = require('pushbots');
var Pushbots = new pushbots.api({
    id: config.pushBot.id,
    secret: config.pushBot.secret
});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },

    filename: function (req, file, cb) {
        var str = file.originalname.split(".");
        console.log(str);

        cb(null, file.fieldname + '-' + Date.now() + '.' + str[str.length - 1]);
    }
});

var upload = multer({storage: storage}).single('image');


// Get list of Chats
exports.index = function (req, res) {
    Chat.find(function (err, Chats) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, Chats);
    });
};

// Get a single Chat
exports.show = function (req, res) {
    Chat.find({chanel: req.params.id}, function (err, Chats) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, Chats);
    });
};

// Creates a new Chat in the DB.
exports.create = function (req, res) {
    Chat.create(req.body, function (err, Chat) {
        if (err) {
            return handleError(res, err);
        }

        if (req.body._id) {
            delete req.body._id;
        }

        Chanel.findById(req.body.chanel)
            .populate('from')
            .populate('users.user')
            .exec(function (err, Chanel) {
                var users = JSON.parse(JSON.stringify(Chanel.users));
                for (var i = 0; i < users.length; i++) {
                    if (users[i].user._id == req.body.from) {
                        users[i].read = 0;
                    } else {
                        users[i].read += 1;
                    }
                }

                Pushbots.setMessage(req.body.text);
                Pushbots.customNotificationTitle(req.body.fromName);
                for (var j = 0; j < Chanel.users.length; j++) {
                    console.log(Chanel.users[j].pushToken);

                    if (Chanel.users[j].user.pushToken) {

                        Pushbots.pushOne(Chanel.users[j].user.pushToken, function(response){
                            console.log(response);
                        });
                    }
                }

                Chanel.users = null;
                var lastMessage = req.body.text;
                if (!lastMessage) {
                    lastMessage = 'send image'
                }
                var updated = _.merge(Chanel, {lastMessage: lastMessage, users: users});
                updated.save();
            });

        return res.json(201, Chat);
    });
};

// upload file
exports.upload = function (req, res) {
    var uploadImage = function (req, res) {
        upload(req, res, function (err) {
            if (err) {
                console.log('Error Occured');
                return;
            }
            res.json(201, req.file.path)
        });
    };

    if (fs.existsSync('./uploads')) {
        uploadImage(req, res)
    } else {
        mkdirp('./uploads', function (err) {
            if (err) console.error(err)
            uploadImage(req, res)
        });
    }
};

// Updates an existing Chat in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Chat.findById(req.params.id, function (err, Chat) {
        if (err) {
            return handleError(res, err);
        }
        if (!Chat) {
            return res.send(404);
        }
        var updated = _.merge(Chat, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, Chat);
        });
    });
};

// Deletes a Chat from the DB.
exports.destroy = function (req, res) {
    Chat.findById(req.params.id, function (err, Chat) {
        if (err) {
            return handleError(res, err);
        }
        if (!Chat) {
            return res.send(404);
        }
        Chat.remove(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(204);
        });
    });
};

function handleError(res, err) {
    return res.send(500, err);
}