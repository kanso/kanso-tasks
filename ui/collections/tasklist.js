var Backbone = require('backbone'),
    Task = require('../models/task').Task;


exports.TaskList = Backbone.Collection.extend({
    model: Task,
    initialize: function (models, options) {
        this.view = options.view;
        this.comparator = options.comparator;
        this.shouldInclude = options.shouldInclude;
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
