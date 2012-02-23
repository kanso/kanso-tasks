var Backbone = require('backbone');


exports.Task = Backbone.Model.extend({
    type: 'task',
    defaults: function () {
        return {
            complete: false
        };
    },
    toggle: function () {
        this.save({complete: !this.get("complete")})
    }
});
