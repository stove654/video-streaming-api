'use strict';

var express = require('express');
var auth = require('../auth.service');
var User = require('../../api/user/user.model');
var jwt = require('jsonwebtoken');
var config = require('../../config/config.js');
var _ = require('lodash');

var router = express.Router();

router.post('/', function (req, res, next) {

    User.findOne({phone: req.body.phone, code: req.body.code}, function (err, user) {
        console.log(err, user)
        if (!user) return res.json({success: false, message: 'wrong code'});
        var token = jwt.sign({_id: user._id }, config.secret, { expiresInMinutes: 60*24*365 });
        return res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token,
            _id: user._id
        });
    });
});

module.exports = router;