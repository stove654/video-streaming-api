/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var chat = require('./chat.model');

exports.register = function(socket) {
  chat.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  chat.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('chat:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('chat:remove', doc);
}