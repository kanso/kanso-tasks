var Backbone = require('backbone'),
    templates = require('handlebars').templates,
    collections = require('./collections'),
    _ = require('underscore')._;


exports.AppView = Backbone.View.extend({
    el: $('#content'),
    template: templates['app.html'],
    initialize: function () {
        this.render();
    },
    render: function () {
        $(this.el).html(this.template({}));
        return this;
    },
    showList: function () {
        var listview = new exports.ListView();
        this.$('#main').html(listview.render().el);
    }
});

exports.ListView = Backbone.View.extend({
    tagName: 'div',
    className: 'list',
    template: templates['list.html'],
    initialize: function () {
        $(this.el).html(this.template({}));
        this.tasks = new collections.TaskList;
        this.tasks.bind('add',   this.addOne, this);
        this.tasks.bind('reset', this.addAll, this);
        this.tasks.bind('all',   this.render, this);
        this.tasks.bind('error', this.error, this);
        this.tasks.fetch();
    },
    render: function () {
        // update stats and other aggregate values
        return this;
    },
    addOne: function (task) {
        var view = new exports.TaskView({model: task});
        this.$('.tasks').append(view.render().el);
    },
    addAll: function () {
        this.tasks.each(_.bind(this.addOne, this));
    },
    error: function (err) {
        console.error(err);
    }
});

exports.TaskView = Backbone.View.extend({
    tagName: 'li',
    template: templates['task.html'],
    events: {
        'click .check': 'toggleDone'
    },
    initialize: function () {
        this.model.bind('change', this.render, this);
        this.model.bind('destroy', this.remove, this);
    },
    render: function () {
        $(this.el).html(
            this.template(this.model.attributes)
        );
        this.setText();
        return this;
    },
    setText: function () {
        var text = this.model.get('text');
        this.$('.todo-text').text(text);
    },
    toggleDone: function () {
        this.model.toggle();
    },
    remove: function () {
        $(this.el).remove();
    },
    clear: function () {
        this.model.destroy();
    }
});
