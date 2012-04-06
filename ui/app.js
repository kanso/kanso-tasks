var Backbone = require('backbone'),
    adapter = require('backbone-adapter'),
    routes = require('./routes'),
    AppView = require('./views/app').AppView;


exports.databaseURL = function () {
    return window.location.pathname.replace(/\/$/,'') + '/api';
};

exports.init = function () {
    // setup backbone-adapter
    Backbone.db = exports.databaseURL();
    Backbone.sync = adapter.sync;

    // create global AppView instance
    window.app_view = new AppView();

    // setup URL router
    new routes.WorkspaceRouter();
    Backbone.history.start({pushState: false});

};
