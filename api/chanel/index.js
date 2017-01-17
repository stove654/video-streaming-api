'use strict';

var express = require('express');
var controller = require('./chanel.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/getChanel/:id', controller.getOneChanel);
router.post('/', controller.create);
router.post('/private/', controller.createPrivate);
router.put('/:id', controller.update);
router.put('/read/:id', controller.updateRead);
router.put('/leaveGroup/:id', controller.leaveGroup);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
router.delete('/messages/:id', controller.destroyMessage);

module.exports = router;
