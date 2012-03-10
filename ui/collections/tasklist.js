var Backbone = require('backbone'),
    Task = require('../models/task').Task;


exports.TaskList = Backbone.Collection.extend({
    model: Task,
    initialize: function (view, comparator) {
        this.view = view;
        this.comparator = comparator;
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
