'use strict';

var express = require('express');
var controller = require('./user.controller');

var router = express.Router();

router.post('/', controller.create);
router.put('/:id', controller.updateContacts);
router.put('/profile/:id', controller.updateProfile);
router.get('/:id', controller.show);
router.get('/phone/:id', controller.showInfo);
router.post('/phone/', controller.createByPhone);

module.exports = router;
