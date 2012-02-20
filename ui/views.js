var Backbone = require('backbone'),
    templates = require('handlebars').templates;


exports.AppView = Backbone.View.extend({
    el: $('#container'),
    initialize: function () {
        this.render();
    },
    render: function () {
        $(this.el).html( templates['app.html']({}) );
    }
});

exports.ListView = Backbone.View.extend({
    el: $('#main'),
    initialize: function () {
        this.render();
    },
    render: function () {
        $(this.el).html( templates['list.html']({}) );
    }
});

/*
exports.AddItem = Backbone.View.extend({
    el: $('#additem'),
    initialize: function () {
        this.render();
    },
    render: function () {
        $(this.el).html( templates['additem.html']({}) );
    }
});

exports.ListItems = Backbone.View.extend({
    el: $('#listitems'),
    initialize: function () {
        this.render();
    },
    render: function () {
        $(this.el).html( templates['listitems.html']({}) );
    }
});
*/
