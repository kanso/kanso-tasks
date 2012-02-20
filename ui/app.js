var Backbone = require('backbone'),
    routes = require('./routes'),
    topbar = require('kanso-topbar');


exports.init = function () {
    new routes.WorkspaceRouter();
    Backbone.history.start({pushState: false});
    topbar.init();
};
