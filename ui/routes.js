var Backbone = require('backbone'),
    views = require('./views');


exports.WorkspaceRouter = Backbone.Router.extend({
    routes: {
        "":        "home",
        "help":    "help"
    },
    help: function() {
        $('#content').text('help');
    },
    home: function() {
        var listview = new views.ListView();
    }
});
