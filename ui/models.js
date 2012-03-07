var Backbone = require('backbone'),
    utils = require('./utils'),
    session = require('session');


exports.Task = Backbone.Model.extend({
    type: 'task',
    defaults: function () {
        var username = session.userCtx ? session.userCtx.name: null;
        return {
            type: 'task',
            complete: false,
            created_by: username,
            list: null,
            created_at: Date.today().toISOString(),
            tags: []
        };
    },
    toggle: function () {
        this.save({complete: !this.get("complete")})
    },
    due_pp: function () {
        var due = this.get('due');
        if (due) {
            return utils.prettyPrintDate(new Date(due));
        }
        return '';
    }
});
