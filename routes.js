/**
 * Main application routes
 */

'use strict';

module.exports = function(app) {
    app.use('/auth', require('./auth'));
    app.use('/api/users', require('./api/user'));
    app.use('/api/chats', require('./api/chat'));
    app.use('/api/chanels', require('./api/chanel'));
    app.use('/api/uploads', require('./api/upload'));
    app.use('/api/calls', require('./api/call'));
    app.use('/api/things', require('./api/thing'));

    app.route('/:url(api|auth)/*')
        .get(function (req, res) {
            res.json({
                message: 'Hello dog!!!'
            })
        });

    app.route('/*')
        .get(function( req, res) {
            res.json({
                message: 'Hello dog!!!'
            })
        });
};
