var Backbone = require('backbone'),
    templates = require('handlebars').templates,
    NavigationView = require('./navigation').NavigationView,
    ListView = require('./list').ListView;


exports.AppView = Backbone.View.extend({
    el: $('#content'),
    template: templates['app.html'],
    initialize: function () {
        this.render();
        this.nav_view = new NavigationView();
    },
    render: function () {
        $(this.el).html(this.template({}));
        return this;
    },
    showTaskList: function (tasks) {
        this.list_view = new ListView(tasks);
        this.$('#main').html(this.list_view.render().el);
    }
});
