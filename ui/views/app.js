var Backbone = require('backbone'),
    templates = require('handlebars').templates,
    NavigationView = require('./navigation').NavigationView,
    TaskList = require('../collections/tasklist').TaskList,
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
    showList: function (view, comparator) {
        var tasks = new TaskList(view, comparator);
        this.list_view = new ListView(tasks);
        this.$('#main').html(this.list_view.render().el);
    }
});
