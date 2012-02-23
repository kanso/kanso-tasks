var Backbone = require('backbone'),
    models = require('./models'),
    app = require('./app');


exports.TaskList = Backbone.Collection.extend({
    view: {
        ddoc: 'kanso-tasks',
        name: 'types',
        query: { key: ['task'] }
    },
    model: models.Task,
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
