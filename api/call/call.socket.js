/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var call = require('./call.model');

exports.register = function(socket) {
  call.schema.post('save', function (doc) {
    call.findById(doc._id)
        .populate('from')
        .populate('to')
        .exec(function (err, data) {
          onSave(socket, data);
        });
  });
  call.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  call.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('call:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('call:remove', doc);
}