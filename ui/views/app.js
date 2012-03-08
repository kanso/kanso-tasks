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
    showList: function (view) {
        this.list_view = new ListView(view);
        this.$('#main').html(this.list_view.render().el);
    }
});
