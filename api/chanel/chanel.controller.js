/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /Chanels              ->  index
 * POST    /Chanels              ->  create
 * GET     /Chanels/:id          ->  show
 * PUT     /Chanels/:id          ->  update
 * DELETE  /Chanels/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Chanel = require('./chanel.model');
var User = require('../user/user.model');
var Chat = require('../chat/chat.model');

// Get list of Chanels
exports.index = function (req, res) {
    Chanel.find()
        .populate('from')
        .populate('users.user')
        .sort({'updatedAt': 'desc'})
        .limit(100)
        .exec(function (err, Chats) {
            var result = [];
            _.each(Chats, function (value) {
                value.from.contacts = null;
                result.push(value);
            });
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, result);
        });
};

// Get a single Chanel
exports.show = function (req, res) {
    Chanel.find()
        .populate('from')
        .populate('users.user')
        .sort({'updatedAt': 'desc'})
        .limit(100)
        .lean()
        .exec(function (err, Chats) {
            if (err) {
                return handleError(res, err);
            }
            var result = [];
            _.each(Chats, function (value) {
                value.from.contacts = null;
                for (var i = 0; i < value.users.length; i ++) {
                    if (value.users[i].user._id == req.params.id) {
                        result.push(value);
                    }
                }
            });

            User.findOne({_id: req.params.id})
                .lean()
                .exec(function (err, user) {
                    if (err) handleError(res, err);

                    result.map(function (chanel) {
                        return getNameContact(chanel, user.contacts);
                    });
                    return res.json(200, result);

                });

        });
};

var getNameContact = function (chanel, listContacts) {

    _.each(chanel.users, function (value) {
        for (var i = 0; i < listContacts.length; i++) {
            if (listContacts[i].phoneNumbers.length && value.user.phone == listContacts[i].phoneNumbers[0].value) {
                value.name = listContacts[i].name.formatted;
                break;
            }
        }
    });
    return chanel;
};

// Get a single Chanel
exports.getOneChanel = function (req, res) {
    Chanel.findOne({_id: req.params.id})
        .populate('from')
        .populate('users.user')
        .lean()
        .exec(function (err, value) {
            if (err) {
                return handleError(res, err);
            }
            value.from.contacts = null;

            User.findOne({_id: req.query.id})
                .lean()
                .exec(function (err, user) {
                    if (err) handleError(res, err);
                    value = getNameContact(value, user.contacts);
                    return res.json(200, value);

                });


        });
};

// Creates a new Chanel in the DB.
exports.create = function (req, res) {
    Chanel.create(req.body, function(err, Chanel) {
        if(err) { return handleError(res, err); }

        Chanel.findOne({_id: Chanel.id})
            .populate('from')
            .populate('users.user')
            .exec(function (err, Chanel) {
                if (err) {
                    return handleError(res, err);
                }
                return res.json(201, Chanel);
            });
    });
};

// Creates a new Chanel Private in the DB.
exports.createPrivate = function(req, res) {
    Chanel.find({isPrivate: true})
        .populate('from')
        .populate('users.user')
        .exec(function (err, chanels) {
            if(err) { return handleError(res, err); }
            for (var i = 0; i < chanels.length; i++) {
                if (chanels[i].from._id == req.body.from && chanels[i].to == req.body.to || chanels[i].from._id == req.body.to && chanels[i].to == req.body.from) {
                    return res.json(201, chanels[i]);
                }
            }
            Chanel.create(req.body, function(err, chanel) {
                if(err) { return handleError(res, err); }
                Chanel.findOne({_id: chanel.id})
                    .populate('from')
                    .populate('users.user')
                    .lean()
                    .exec(function (err, chanel) {
                        if (err) {
                            return handleError(res, err);
                        }

                        User.findOne({_id: chanel.from._id})
                            .lean()
                            .exec(function (err, user) {
                                if (err) handleError(res, err);
                                chanel = getNameContact(chanel, user.contacts);
                                return res.json(201, chanel);

                            });
                    });
            });
        });
};

// Updates an existing Chanel in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Chanel.findById(req.params.id, function (err, Chanel) {
        if (err) {
            return handleError(res, err);
        }
        if (!Chanel) {
            return res.send(404);
        }
        var updated = _.merge(Chanel, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, Chanel);
        });
    });
};

// Updates an existing Chanel in the DB.
exports.leaveGroup = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Chanel.findById(req.params.id, function (err, Chanel) {
        if (err) {
            return handleError(res, err);
        }
        if (!Chanel) {
            return res.send(404);
        }
        for (var i = 0; i < Chanel.users.length; i++) {
            if (Chanel.users[i].user == req.body.id) {
                Chanel.users.splice(i, 1);
                break;
            }
        }

        var updated = Chanel
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, Chanel);
        });
    });
};


// Updates an existing Chanel in the DB.
exports.updateRead = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Chanel.findById(req.params.id, function (err, Chanel) {
        if (err) {
            return handleError(res, err);
        }
        if (!Chanel) {
            return res.send(404);
        }
        var users = JSON.parse(JSON.stringify(Chanel.users));
        for (var i = 0; i < users.length; i++) {
            if (users[i].user == req.body.user) {
                users[i].read = 0;
                break
            }
        }
        Chanel.users = null;

        var updated = _.merge(Chanel, {users: users});
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, Chanel);
        });
    });
};


// Deletes a Chanel from the DB.
exports.destroy = function (req, res) {
    Chanel.findById(req.params.id, function (err, Chanel) {
        if (err) {
            return handleError(res, err);
        }
        if (!Chanel) {
            return res.send(404);
        }
        Chanel.remove(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(204);
        });
    });
};

// Deletes a message from the DB.
exports.destroyMessage = function (req, res) {
    Chat.find({chanel: req.params.id}).remove(function () {
        res.send(204)
    });
};

function handleError(res, err) {
    return res.send(500, err);
}