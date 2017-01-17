/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /Calls              ->  index
 * POST    /Calls              ->  create
 * GET     /Calls/:id          ->  show
 * PUT     /Calls/:id          ->  update
 * DELETE  /Calls/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Call = require('./call.model');

// Get list of Calls
exports.index = function (req, res) {
    Call.find()
        .populate('from')
        .populate('to')
        .sort({'updatedAt': 'desc'})
        .limit(100)
        .lean()
        .exec(function (err, calls) {
            if (err) {
                return handleError(res, err);
            }
            var result = [];
            _.each(calls, function (value) {
                if (value.from._id == req.query.id || value.to._id == req.query.id) {
                    value.from.contacts = null;
                    value.to.contacts = null;
                    result.push(value);
                }
            });
            return res.json(200, result);
        });
};

// Get a single Call
exports.show = function (req, res) {
    Call.findById(req.params.id, function (err, Call) {
        if (err) {
            return handleError(res, err);
        }
        if (!Call) {
            return res.send(404);
        }
        return res.json(Call);
    });
};

// Creates a new Call in the DB.
exports.create = function (req, res) {
    Call.create(req.body, function (err, Call) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, Call);
    });
};

// Updates an existing Call in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Call.findById(req.params.id, function (err, Call) {
        if (err) {
            return handleError(res, err);
        }
        if (!Call) {
            return res.send(404);
        }
        var updated = _.merge(Call, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, Call);
        });
    });
};

// Deletes a Call from the DB.
exports.destroy = function (req, res) {
    Call.findById(req.params.id, function (err, Call) {
        if (err) {
            return handleError(res, err);
        }
        if (!Call) {
            return res.send(404);
        }
        Call.remove(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(204);
        });
    });
};

function handleError(res, err) {
    return res.send(500, err);
}