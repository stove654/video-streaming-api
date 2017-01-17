'use strict';

var express = require('express');
var auth = require('../auth.service');
var User = require('../../api/user/user.model');
var jwt = require('jsonwebtoken');
var config = require('../../config/config.js');
var _ = require('lodash');

var router = express.Router();
var client = require('twilio')(config.accountSid, config.authToken);

var validationError = function(res, err) {
    return res.json(422, err);
};

//require the Twilio module and create a REST client

var renderCode = function () {
    var results = "";
    for ( var i = 0; i<5; i++ ) {
        results += Math.floor((Math.random() * 10) + 1);
    }
    return results;
};

router.post('/', function (req, res, next) {
    var code = renderCode();

    client.messages.create({
        to: req.body.phone,
        from: config.yourPhone,
        body: "Your viber code is: " + code + " .Close this message and enter the code into Viber to activate your account."
    }, function(err, message) {
        if (err) throw err;

        User.findOne({phone: req.body.phone}, function (err, user) {
            if (err) throw err;
            if (user) {
                User.findById(user._id, function (err, user) {
                    if (err || !user) { return }
                    var data = {
                        contacts: req.body.contacts,
                        active: false,
                        code: code
                    };
                    var updated = _.merge(user, data);
                    updated.save(function (err) {

                    });
                });
                var token = jwt.sign({_id: user._id }, config.secret, { expiresInMinutes: 60*24*365 });
                return res.json({
                    phone: user.phone
                });
            }
            var newUser = new User(req.body);
            newUser.provider = 'local';
            newUser.role = 'user';
            newUser.active = false;
            newUser.code = code;
            newUser.save(function(err, user) {
                if (err) return validationError(res, err);
                var token = jwt.sign({_id: user._id }, config.secret, { expiresInMinutes: 60*24*365 });
                res.json({
                    phone: user.phone
                })
                //res.json({
                //    success: true,
                //    message: 'Enjoy your token!',
                //    token: token,
                //    _id: user._id
                //});
            });
        });
    });

});

module.exports = router;