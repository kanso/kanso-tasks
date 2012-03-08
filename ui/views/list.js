var Backbone = require('backbone'),
    templates = require('handlebars').templates,
    TaskList = require('../collections/tasklist').TaskList,
    TaskView = require('./task').TaskView,
    utils = require('../utils'),
    _ = require('underscore');


exports.ListView = Backbone.View.extend({
    tagName: 'div',
    className: 'list',
    template: templates['list.html'],
    events: {
        'keyup     #new-task':          'createOnEnter',
        'focus     #new-task':          'restartTimer',
        'blur      #new-task':          'hideTip',
        'click     .handle':            'toggleActions',
        'mouseover .handle':            'peekActions',
        'mouseout  .handle':            'unpeekActions',
        'click     tr .select input':   'checkSelection'
    },
    initialize: function (view) {
        $(this.el).html(this.template({}));
        this.input = this.$('#new-task');

        this.tasks = new TaskList(view);
        this.tasks.bind('add',   this.addOne, this);
        this.tasks.bind('reset', this.addAll, this);
        this.tasks.bind('all',   this.render, this);
        this.tasks.bind('error', this.error, this);
        this.tasks.fetch();

        // when clicking on a task, deselect all others and then
        // select targetted task row

        var that = this;
        this.$('.task-table tr').live('click', function (ev) {
            if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'A') {
                // don't interfere with input element events or link clicks
                return;
            }
            that.toggleSingleRow(this);
            that.checkSelection();
        });
    },
    render: function () {
        // update stats and other aggregate values
        return this;
    },
    addOne: function (task) {
        var view = new TaskView({model: task});
        this.$('.task-table tbody').append(view.render().el);
    },
    addAll: function () {
        this.tasks.each(_.bind(this.addOne, this));
    },
    error: function (err) {
        console.error(err);
    },
    showActions: function () {
        this.$('.selection-actions').removeClass('closed');
        this.$('.handle-label').text('HIDE');
    },
    hideActions: function () {
        this.$('.selection-actions').addClass('closed');
        this.$('.handle-label').text('MORE');
    },
    toggleActions: function () {
        if (this.$('.selection-actions').hasClass('closed')) {
            this.showActions();
        }
        else {
            this.hideActions();
        }
    },
    hideTip: function () {
        if ($(this.input).data('tooltip')) {
            $(this.input).data('tooltip').hide();
        }
    },
    showTip: function (text) {
        // create tooltip if it doesn't already exist
        if (!$(this.input).data('tooltip')) {
            $(this.input).tooltip({
                animation: true,
                placement: 'right',
                trigger: 'manual',
                title: text,
                delay: 0
            });
        }
        var tooltip = $(this.input).data('tooltip');
        tooltip.options.title = text;
        tooltip.show();
    },
    nextTip: function () {
        var val = $(this.input).val();
        if (!val || !$(this.input).is(':focus')) {
            // don't show tip if input doesn't have focus
            // or there's no text entered
            return;
        }
        var task = utils.parseTask(val);
        if (!task.due) {
            this.showTip(
                'You can add a date too! eg. "Tomorrow", "25th April"'
            );
        }
        else if (!task.priority) {
            this.showTip('Prioritize this task by typing !1, !2 or !3');
        }
        else if (!task.tags.length) {
            this.showTip(
                'You can add tags using "#", eg. #shopping #work'
            );
        }
        else {
            this.showTip('Hit ENTER to add this task');
        }
    },
    peekActions: function () {
        if (this.$('.selection-actions').hasClass('closed')) {
            this.$('.selection-actions .handle').addClass('peek');
        }
        else {
            this.unpeekActions();
        }
    },
    unpeekActions: function () {
        this.$('.selection-actions .handle').removeClass('peek');
    },
    toggleSingleRow: function (el) {
        var trs = $(el).siblings('tr');
        var checked = $('.select input', el).is(':checked');
        var others_checked = !!($('.select input:checked', trs).length);

        $('.select input', trs).attr({checked: null});
        trs.removeClass('selected');

        if (!checked || others_checked) {
            $(el).addClass('selected');
            $('.select input', el).attr({checked: 'checked'});
        }
        else {
            $(el).removeClass('selected');
            $('.select input', el).attr({checked: null});
        }
    },
    restartTimer: function () {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(_.bind(this.nextTip, this), 1500);
    },
    checkSelection: function () {
        //count selected
        //check if hovering over
        //check if manually opened?
        var els = this.$('.task-table :checked');
        if (els.length) {
            this.showActions();
        }
        else {
            this.hideActions();
        }
    },
    createOnEnter: function (ev) {
        var text = this.input.val();
        if (text) {
            if (ev.keyCode === 13) {
                if (this.timer) {
                    clearTimeout(this.timer);
                }
                var task = utils.parseTask(text);
                this.tasks.create(task);
                this.input.val('');
                this.prev_text = null;
                this.hideTip();
                return;
            }
            // this avoids arrow keys etc from making tooltips flicker
            if (text !== this.prev_text) {
                this.hideTip();
                this.restartTimer();
            }
        }
        else {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.hideTip();
        }
        this.prev_text = text;
    }
});
