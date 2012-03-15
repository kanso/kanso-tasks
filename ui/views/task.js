var Backbone = require('backbone'),
    templates = require('handlebars').templates,
    _ = require('underscore');


exports.TaskView = Backbone.View.extend({
    tagName: 'tr',
    template: templates['task.html'],
    /*
    events: {
        'click .selected input': 'toggleDone'
    },
    */
    initialize: function () {
        this.model.bind('error', this.error, this);
        this.model.bind('change', this.render, this);
        this.model.bind('destroy', this.remove, this);
    },
    error: function (err) {
        console.error(err);
    },
    render: function () {
        var el = this.el;

        // test if checked
        var checked = $('.select input', this.el).is(':checked');

        $(el).html(
            this.template(_.extend({
                due_pp: this.model.due_pp(),
                isNew: this.model.isNew()
            }, this.model.attributes))
        );
        if (checked) {
            $('.select input', this.el).attr({checked: 'checked'});
            $(el).addClass('selected');
        }
        else {
            $(el).removeClass('selected');
        }

        if (this.model.isNew()) {
            $(el).addClass('new');
            this.$('.select input').remove();
            var spinner = new Spinner({
                lines: 8, // The number of lines to draw
                length: 4, // The length of each line
                width: 2, // The line thickness
                radius: 4, // The radius of the inner circle
                color: '#000', // #rgb or #rrggbb
                speed: 1, // Rounds per second
                trail: 60, // Afterglow percentage
                shadow: false, // Whether to render a shadow
                hwaccel: false, // Whether to use hardware acceleration
                className: 'spinner', // The CSS class to assign to the spinner
                zIndex: 2e9, // The z-index (defaults to 2000000000)
                top: 'auto', // Top position relative to parent in px
                left: 'auto' // Left position relative to parent in px
            });
            spinner.spin(this.$('.select'));
        }
        else {
            $(el).removeClass('new');
        }

        $(el).attr({rel: this.model.get('_id')});

        $(el).removeClass('priority1');
        $(el).removeClass('priority2');
        $(el).removeClass('priority3');

        if (this.model.get('priority')) {
            $(el).addClass('priority' + this.model.get('priority'));
        }
        if (this.model.get('complete')) {
            $(el).addClass('complete');
        }
        else {
            $(el).removeClass('complete');
        }
        if (this.model.overdue()) {
            $(el).addClass('overdue');
        }
        else {
            $(el).removeClass('overdue');
        }
        if (this.model.due_today()) {
            $(el).addClass('today');
        }
        else {
            $(el).removeClass('today');
        }

        this.setText();
        this.$('.select input').change(function (ev) {
            if (this.checked) {
                $(el).addClass('selected');
            }
            else {
                $(el).removeClass('selected');
            }
        });
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
