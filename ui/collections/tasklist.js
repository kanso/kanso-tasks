var Backbone = require('backbone'),
    Task = require('../models/task').Task;


exports.TaskList = Backbone.Collection.extend({
    view: {
        ddoc: 'kanso-tasks',
        name: 'incomplete_by_priority_and_due'
    },
    model: Task,
    initialize: function (view) {
        if (view) {
            this.view = view;
        }
    },
    complete: function () {
        return this.filter(function (task) {
            return task.get('complete');
        });
    },
    incomplete: function () {
        return this.reject(function (task) {
            return task.get('complete');
        });
    }
});
