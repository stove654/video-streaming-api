/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var chanel = require('./chanel.model');

exports.register = function (socket) {
    chanel.schema.post('save', function (doc) {
        chanel.findById(doc._id)
            .populate('from')
            .populate('to')
            .populate('users.user')
            .sort({'createdAt': 'desc'})
            .exec(function (err, data) {
                onSave(socket, data);
            });
    });
    chanel.schema.post('remove', function (doc) {
        onRemove(socket, doc);
    });
};

function onSave(socket, doc, cb) {
    socket.emit('chanel:save', doc);
}

function onRemove(socket, doc, cb) {
    socket.emit('chanel:remove', doc);
}