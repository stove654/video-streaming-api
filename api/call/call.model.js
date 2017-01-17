'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CallSchema = new Schema({
    from: {type: Schema.Types.ObjectId, ref: 'User'},
    to: {type: Schema.Types.ObjectId, ref: 'User'},
    count: {
        type: Number,
        default: 1
    },
    status: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('Call', CallSchema);