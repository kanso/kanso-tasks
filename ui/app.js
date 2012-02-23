var Backbone = require('backbone'),
    adapter = require('backbone-adapter'),
    topbar = require('kanso-topbar'),
    routes = require('./routes');


exports.databaseURL = function () {
    return window.location.pathname.replace(/\/$/,'') + '/api';
};

exports.init = function () {
    // setup backbone-adapter
    Backbone.db = exports.databaseURL();
    Backbone.sync = adapter.sync;

    // setup URL router
    new routes.WorkspaceRouter();
    Backbone.history.start({pushState: false});

    // initialize kanso-topbar
    topbar.init();
};
