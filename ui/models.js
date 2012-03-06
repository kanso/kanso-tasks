var Backbone = require('backbone'),
    utils = require('./utils');


exports.Task = Backbone.Model.extend({
    type: 'task',
    defaults: function () {
        return {
            type: 'task',
            complete: false
        };
    },
    toggle: function () {
        this.save({complete: !this.get("complete")})
    },
    due_pp: function () {
        return utils.prettyPrintDate(this.get("due"));
    }
});
