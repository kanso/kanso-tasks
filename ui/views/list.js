var Backbone = require('backbone'),
    templates = require('handlebars').templates,
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
        'click     tr .select input':   'updateSelection',
        'click     .complete-btn':      'completeSelected',
        'click     .postpone-btn':      'postponeSelected',
        'mouseover .controls':          'overControls',
        'mouseout  .controls':          'outControls'
    },
    initialize: function (tasks) {
        $(this.el).html(this.template({}));
        this.input = this.$('#new-task');

        this.tasks = tasks;
        this.tasks.bind('add',    this.addOne,         this);
        this.tasks.bind('change', this.checkSelection, this);
        this.tasks.bind('reset',  this.addAll,         this);
        this.tasks.bind('all',    this.render,         this);
        this.tasks.bind('error',  this.error,          this);
        this.tasks.fetch();

        this.checkSelection();

        // when clicking on a task, deselect all others and then
        // select targetted task row

        var that = this;
        this.$('.task-table tr').live('click', function (ev) {
            if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'A') {
                // don't interfere with input element events or link clicks
                return;
            }
            that.toggleSingleRow(this);
            that.updateSelection(ev);
        });
        this.$('input.group-select').click(function (ev) {
            // the :checked change has already occurred
            // when this event handle fires!
            if ($(this).is(':checked')) {
                if (that.some && that.some.length) {
                    $(this).addClass('some');
                    that.some.attr({checked: 'checked'}).change();
                }
                else {
                    $(this).removeClass('some');
                    // select all
                    that.$('.task-table tr .select input').attr({
                        checked: 'checked'
                    }).change();
                }
                $(this).attr({checked: 'checked'});
            }
            else {
                if ($(this).hasClass('some')) {

                    // select all
                    that.$('.task-table tr .select input').attr({
                        checked: 'checked'
                    }).change();

                    $(this).removeClass('some');
                    $(this).attr({checked: 'checked'});
                }
                else {
                    // deselect all
                    that.$('.task-table tr .select input').attr({
                        checked: null
                    }).change();
                    $(this).attr({checked: null});
                }
            }
            // once the group-select checkbox has been clicked,
            // don't hold open the controls even if manually opened
            that.hold_actions_open = false;

            that.checkSelection();
        });
    },
    render: function () {
        // update stats and other aggregate values
        return this;
    },
    addOne: function (task) {
        var view = new TaskView({model: task});
        var i = this.tasks.indexOf(task);
        var tbody = this.$('.task-table tbody');
        var tr = view.render().el;

        if (i === -1) {
            // TODO: throw error?
            tbody.append(tr);
        }
        else if(i === 0) {
            tbody.prepend(tr);
        }
        else {
            $("tr:nth-child(" + i + ")", tbody).after(tr);
        }
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
        this.hold_actions_open = false;
        this.$('.selection-actions').addClass('closed');
        this.$('.handle-label').text('MORE');
    },
    toggleActions: function () {
        if (this.$('.selection-actions').hasClass('closed')) {
            this.hold_actions_open = true;
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
    updateSelection: function (ev) {
        var checked = this.$('.task-table .select input:checked');
        var all = this.$('.task-table .select input');

        if (checked.length) {
            if (checked.length === all.length) {
                this.some = null;
            }
            else {
                this.some = checked;
            }
        }
        else {
            this.some = null;
        }
        this.checkSelection(ev);
    },
    checkSelection: function (ev) {
        var checked = this.$('.task-table .select input:checked');
        var all = this.$('.task-table .select input');

        if (checked.length) {
            this.showActions();

            var group = this.$('input.group-select');
            if (checked.length === all.length) {
                group.removeClass('some');
            }
            else {
                group.addClass('some');
            }
            group.attr({checked: 'checked'});

            this.$('.complete-btn').removeClass('disabled');
            this.$('.postpone-btn').removeClass('disabled');
            this.$('.more-btn').removeClass('disabled');

            if (checked.length === 1) {
                this.$('.edit-btn').removeClass('disabled');
            }
            else {
                this.$('.edit-btn').addClass('disabled');
            }
        }
        else {
            if (!this.hover_controls) {
                this.hideActions();
            }

            var group = this.$('input.group-select');
            group.removeClass('some');
            group.attr({checked: null});

            this.$('.complete-btn').addClass('disabled');
            this.$('.postpone-btn').addClass('disabled');
            this.$('.edit-btn').addClass('disabled');
            this.$('.more-btn').addClass('disabled');
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
    },
    completeSelected: function (ev) {
        ev.preventDefault();
        var that = this;
        this.$('.task-table tr.selected').each(function () {
            var id = $(this).attr('rel');
            var task = that.tasks.get(id);
            task.set('complete', true);
            task.save();
        });
        return false;
    },
    postponeSelected: function (ev) {
        ev.preventDefault();
        var that = this;
        this.$('.task-table tr.selected').each(function () {
            var id = $(this).attr('rel');
            var task = that.tasks.get(id);
            if (!task.get('due')) {
                // don't try to postpone tasks without a due date
                return;
            }
            var due = new Date(task.get('due'));
            if (due < Date.today()) {
                // due date is in the past, set it to today
                due = Date.today();
            }
            else {
                // push due date forward one day
                due.add({days: 1});
            }
            task.set('due', due.toISOString());
            task.save();
        });
        return false;
    },
    overControls: function () {
        this.hover_controls = true;
        clearTimeout(this.hover_hide_timer);
    },
    outControls: function () {
        this.hover_controls = false;

        var that = this;
        if (!this.hold_actions_open) {
            this.hover_hide_timer = setTimeout(function () {
                var checked = this.$('.task-table .select input:checked');
                if (!checked.length) {
                    that.hideActions();
                }
            }, 400);
        }
    }
});
