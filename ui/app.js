var Backbone = require('backbone'),
    adapter = require('backbone-adapter'),
    topbar = require('kanso-topbar'),
    routes = require('./routes'),
    views = require('./views');


exports.databaseURL = function () {
    return window.location.pathname.replace(/\/$/,'') + '/api';
};

exports.init = function () {
    // setup backbone-adapter
    Backbone.db = exports.databaseURL();
    Backbone.sync = adapter.sync;

    // create global AppView instance
    window.app_view = new views.AppView();

    // setup URL router
    new routes.WorkspaceRouter();
    Backbone.history.start({pushState: false});

    // initialize kanso-topbar
    topbar.init();
};
