var Backbone = require('backbone'),
    TaskList = require('./collections/tasklist').TaskList,
    _ = require('underscore');


exports.WorkspaceRouter = Backbone.Router.extend({
    routes: {
        "":                    "listIncomplete",
        "help":                "help",
        "all":                 "listIncomplete",
        "all/incomplete":      "listIncomplete",
        "all/overdue":         "listOverdue",
        "all/today":           "listToday",
        "all/week":            "listWeek",
        "all/complete":        "listComplete",
        "tag/:tag":            "listIncomplete",
        "tag/:tag/incomplete": "listIncomplete",
        "tag/:tag/overdue":    "listOverdue",
        "tag/:tag/today":      "listToday",
        "tag/:tag/week":       "listWeek",
        "tag/:tag/complete":   "listComplete"
    },
    help: function() {
        $('#content').text('help');
    },
    listIncomplete: function (tag) {
        tag = tag || null;
        var tasks = new TaskList(null, {
            view: {
                ddoc: 'kanso-tasks',
                name: 'incomplete_by_tag_priority_and_due',
                query: { startkey: [tag], endkey: [tag, {}] }
            },
            comparator: function (task) {
                return [
                    task.get('priority') || 4,
                    task.get('due') || {}
                ];
            },
            shouldInclude: function (task) {
                return !task.get('complete') &&
                       (!tag || _.include(task.get('tags'), tag));
            }
        });
        window.app_view.nav_view.selectNav(tag, 'incomplete');
        window.app_view.showTaskList(tasks);
    },
    listOverdue: function (tag) {
        tag = tag || null;
        var today = Date.today().toISOString();
        var tasks = new TaskList(null, {
            view: {
                ddoc: 'kanso-tasks',
                name: 'incomplete_by_tag_due_and_priority',
                query: { startkey: [tag], endkey: [tag, today] }
            },
            comparator: function (task) {
                return [
                    task.get('due') || {},
                    task.get('priority') || 4
                ];
            },
            shouldInclude: function (task) {
                return !task.get('complete') &&
                       (!tag || _.include(task.get('tags'), tag)) &&
                       (task.get('due') && task.get('due') < today)
            }
        });
        window.app_view.nav_view.selectNav(tag, 'overdue');
        window.app_view.showTaskList(tasks);
    },
    listToday: function (tag) {
        tag = tag || null;
        var t = Date.today();
        var today = t.toISOString();
        var tomorrow = t.clone().add({days: 1}).toISOString();
        var tasks = new TaskList(null, {
            view: {
                ddoc: 'kanso-tasks',
                name: 'incomplete_by_tag_due_and_priority',
                query: { startkey: [tag, today], endkey: [tag, tomorrow] }
            },
            comparator: function (task) {
                return [
                    task.get('due') || {},
                    task.get('priority') || 4
                ];
            },
            shouldInclude: function (task) {
                return !task.get('complete') &&
                       (!tag || _.include(task.get('tags'), tag)) &&
                       task.get('due') &&
                       task.get('due') >= today && task.get('due') < tomorrow
            }
        });
        window.app_view.nav_view.selectNav(tag, 'today');
        window.app_view.showTaskList(tasks);
    },
    listWeek: function (tag) {
        tag = tag || null;
        var t = Date.today();
        var today = t.toISOString();
        var next_week = t.clone().add({weeks: 1}).toISOString();
        var tasks = new TaskList(null, {
            view: {
                ddoc: 'kanso-tasks',
                name: 'incomplete_by_tag_due_and_priority',
                query: { startkey: [tag, today], endkey: [tag, next_week] }
            },
            comparator: function (task) {
                return [
                    task.get('due') || {},
                    task.get('priority') || 4
                ];
            },
            shouldInclude: function (task) {
                return !task.get('complete') &&
                       (!tag || _.include(task.get('tags'), tag)) &&
                       task.get('due') &&
                       task.get('due') >= today && task.get('due') < next_week
            }
        });
        window.app_view.nav_view.selectNav(tag, 'week');
        window.app_view.showTaskList(tasks);
    },
    listComplete: function (tag) {
        tag = tag || null;
        var tasks = new TaskList(null, {
            view: {
                ddoc: 'kanso-tasks',
                name: 'complete_by_tag_and_completed_at',
                query: { startkey: [tag], endkey: [tag, {}] }
            },
            comparator: function (task) {
                return task.get('completed_at') || {};
            },
            shouldInclude: function (task) {
                return task.get('complete') &&
                       (!tag || _.include(task.get('tags'), tag));
            }
        });
        window.app_view.nav_view.selectNav(tag, 'complete');
        window.app_view.showTaskList(tasks);
    }
});
