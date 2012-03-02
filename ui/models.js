var Backbone = require('backbone');


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
    }
});
