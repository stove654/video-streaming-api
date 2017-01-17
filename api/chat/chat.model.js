'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    User = require('../user/user.model'),
    Chanel = require('../chanel/chanel.model');

var ChatSchema = new Schema({
    from: { type: Schema.Types.ObjectId, ref: 'User' },
    to: { type: Schema.Types.ObjectId, ref: 'User' },
    text: String,
    chanel: { type: Schema.Types.ObjectId, ref: 'Chanel' },
    image: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Chat', ChatSchema);