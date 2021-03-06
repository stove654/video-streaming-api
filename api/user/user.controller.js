'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/config.js');
var jwt = require('jsonwebtoken');
var _ = require('lodash');

var validationError = function (res, err) {
    return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function (req, res) {
    User.find({}, '-salt -hashedPassword', function (err, users) {
        if (err) return res.send(500, err);
        res.json(200, users);
    });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
    var newUser = new User(req.body);
    newUser.provider = 'local';
    newUser.role = 'admin';
    newUser.save(function (err, user) {
        if (err) return validationError(res, err);
        var token = jwt.sign({_id: user._id}, config.secret, {expiresInMinutes: 60 * 5});
        res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token
        });
    });
};


// Updates an existing contact in the DB.
exports.updateContacts = function(req, res) {
    if(req.body._id) { delete req.body._id; }
    User.findById(req.params.id, function (err, user) {
        if (err) { return handleError(res, err); }
        if(!user) { return res.send(404); }
        var data = {
            contacts: req.body.contacts
        };
        user.contacts = null;
        var updated = _.merge(user, data);
        updated.save(function (err, user1) {
            if (err) { return handleError(res, err); }
            User.find()
                .lean()

                .exec(function (err, users) {
                    if (err) return res.send(500, err);
                    user1 = getContacts(user1, users);
                    res.json(200, user1);
                });
        });
    });
};


// Updates an existing contact in the DB.
exports.updateProfile = function(req, res) {
    if(req.body._id) { delete req.body._id; }
    User.findById(req.params.id, function (err, user) {
        if (err) { return handleError(res, err); }
        if(!user) { return res.send(404); }

        var data = {
        };

        if (req.body.avatar) {
            data.avatar = req.body.avatar
        }
        if (req.body.pushToken) {
            data.pushToken = req.body.pushToken
        }

        var updated = _.merge(user, data);
        updated.save(function (err, user) {
            if (err) { return handleError(res, err); }
            return res.json(200, user);
        });
    });
};


/**
 * Creates a new user
 */
exports.createByPhone = function (req, res, next) {
    var newUser = new User(req.body);
    newUser.provider = 'local';
    newUser.role = 'user';
    newUser.timestamp = new Date().getTime();
    newUser.save(function (err, user) {
        if (err) return validationError(res, err);
        var token = jwt.sign({_id: user._id}, config.secret, {expiresInMinutes: 60 * 24 * 365});
        res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token
        });
    });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
    var userId = req.params.id;

    User.findById(userId, function (err, user) {
        if (err) return next(err);
        if (!user) return res.send(401);

        User.find()
            .lean()
            .exec(function (err, users) {
                if (err) return res.send(500, err);
                user = getContacts(user, users);
                res.json(200, user);
            });
    });
};

exports.showInfo = function (req, res, next) {
    var phone = req.params.id;

    User.findOne({phone: phone}, function (err, user) {
        if (err) return next(err);
        if (!user) return res.send(401);
        console.log('test');
        user.contacts = null;
        res.json(200, user);
    });

};

var getContacts = function (user, users) {
    console.log('111111');
    for (var j = 0; j < user.contacts.length; j++) {
        for (var i = 0; i < users.length; i++) {
            if (user.contacts[j].phoneNumbers.length && user.contacts[j].phoneNumbers[0].value == users[i].phone) {
                console.log(user.contacts[j].phoneNumbers[0].value, users[i].phone)
                user.contacts[j].active = true;
                user.timestamp = new Date().getTime();
                user.contacts[j]._id = users[i]._id;
                user.contacts[j].avatar = users[i].avatar;
                break;
            }
        }
    }
    return user
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function (req, res) {
    User.findByIdAndRemove(req.params.id, function (err, user) {
        if (err) return res.send(500, err);
        return res.send(204);
    });
};

/**
 * Change a users password
 */
exports.changePassword = function (req, res, next) {
    var userId = req.user._id;
    var oldPass = String(req.body.oldPassword);
    var newPass = String(req.body.newPassword);

    User.findById(userId, function (err, user) {
        if (user.authenticate(oldPass)) {
            user.password = newPass;
            user.save(function (err) {
                if (err) return validationError(res, err);
                res.send(200);
            });
        } else {
            res.send(403);
        }
    });
};

/**
 * Get my info
 */
exports.me = function (req, res, next) {
    var userId = req.user._id;
    User.findOne({
        _id: userId
    }, '-salt -hashedPassword', function (err, user) { // don't ever give out the password or salt
        if (err) return next(err);
        if (!user) return res.json(401);
        res.json(user);
    });
};

/**
 * Authentication callback
 */
exports.authCallback = function (req, res, next) {
    res.redirect('/');
};

function handleError(res, err) {
    return res.send(500, err);
}