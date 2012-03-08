var Backbone = require('backbone'),
    views = require('./views');


exports.WorkspaceRouter = Backbone.Router.extend({
    routes: {
        "":                 "all",
        "help":             "help",
        "all":              "all",
        "all/:subset":      "all",
    },

    help: function() {
        $('#content').text('help');
    },

    all: function (subset) {

        var t = Date.today();
        var today = t.toISOString();
        var tomorrow = t.clone().add({days: 1}).toISOString();
        var next_week = t.clone().add({weeks: 1}).toISOString();

        subset = subset || 'incomplete';
        window.app_view.nav_view.selectNav(null, subset);

        switch (subset) {
            case 'overdue':
                window.app_view.showList({
                    ddoc: 'kanso-tasks',
                    name: 'incomplete_by_due_and_priority',
                    query: { startkey: [], endkey: [today] }
                });
                break;
            case 'today':
                window.app_view.showList({
                    ddoc: 'kanso-tasks',
                    name: 'incomplete_by_due_and_priority',
                    query: { startkey: [today], endkey: [tomorrow] }
                });
                break;
            case 'week':
                window.app_view.showList({
                    ddoc: 'kanso-tasks',
                    name: 'incomplete_by_due_and_priority',
                    query: { startkey: [today], endkey: [next_week] }
                });
                break;
            case 'complete':
                window.app_view.showList({
                    ddoc: 'kanso-tasks',
                    name: 'complete_by_completed_at'
                });
                break;
            default:
                // incomplete
                window.app_view.showList({
                    ddoc: 'kanso-tasks',
                    name: 'incomplete_by_priority_and_due'
                });
                break;
        }

    }
});
