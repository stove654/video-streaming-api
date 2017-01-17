'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    User = require('../user/user.model');

var ChanelSchema = new Schema({
    users: [
        {
            user: {type: Schema.Types.ObjectId, ref: 'User'},
            read: {
                type: Number,
                default: 0
            }
        }
    ],
    from: {type: Schema.Types.ObjectId, ref: 'User'},
    to: {type: Schema.Types.ObjectId, ref: 'User'},
    lastMessage: String,
    isPrivate: Boolean,
    avatar: {
        type: String,
        default: 'https://s3-ap-southeast-1.amazonaws.com/stove-arstist/People-on_Cloud-512.png'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Chanel', ChanelSchema);