var Backbone = require('backbone'),
    views = require('./views');


exports.WorkspaceRouter = Backbone.Router.extend({
    routes: {
        "":                 "all",
        "help":             "help",
        "all":              "all",
        "all/:subset":      "all",
        "all/:subset":      "all",
        "tag/:tag":         "tag",
        "tag/:tag/:subset": "tag"
    },
    help: function() {
        $('#content').text('help');
    },
    all: function (subset) {
        return this.tag(null, subset);
    },
    tag: function (tag, subset) {
        var t = Date.today();
        var today = t.toISOString();
        var tomorrow = t.clone().add({days: 1}).toISOString();
        var next_week = t.clone().add({weeks: 1}).toISOString();

        subset = subset || 'incomplete';
        window.app_view.nav_view.selectNav(tag, subset);

        switch (subset) {
            case 'overdue':
                window.app_view.showList({
                    ddoc: 'kanso-tasks',
                    name: 'incomplete_by_tag_due_and_priority',
                    query: { startkey: [tag], endkey: [tag, today] }
                });
                break;
            case 'today':
                window.app_view.showList({
                    ddoc: 'kanso-tasks',
                    name: 'incomplete_by_tag_due_and_priority',
                    query: { startkey: [tag, today], endkey: [tag, tomorrow] }
                });
                break;
            case 'week':
                window.app_view.showList({
                    ddoc: 'kanso-tasks',
                    name: 'incomplete_by_tag_due_and_priority',
                    query: { startkey: [tag, today], endkey: [tag, next_week] }
                });
                break;
            case 'complete':
                window.app_view.showList({
                    ddoc: 'kanso-tasks',
                    name: 'complete_by_tag_and_completed_at',
                    query: { startkey: [tag], endkey: [tag, {}] }
                });
                break;
            default:
                // incomplete
                window.app_view.showList({
                    ddoc: 'kanso-tasks',
                    name: 'incomplete_by_tag_priority_and_due',
                    query: { startkey: [tag], endkey: [tag, {}] }
                });
                break;
        }
    }
});
