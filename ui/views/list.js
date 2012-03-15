var Backbone = require('backbone'),
    templates = require('handlebars').templates,
    TaskView = require('./task').TaskView,
    Task = require('../models/task').Task,
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
        'mouseout  .controls':          'outControls',
        'click     .edit-btn':          'showEditModal'
    },
    initialize: function (tasks) {
        $(this.el).html(this.template({}));
        this.input = this.$('#new-task');

        this.tasks = tasks;
        this.tasks.on('add',    this.addOne,  this);
        this.tasks.on('change', this.change,  this);
        this.tasks.on('sync',   this.change,  this);
        this.tasks.on('reset',  this.reset,   this);
        this.tasks.on('all',    this.render,  this);
        this.tasks.on('error',  this.error,   this);
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
    change: function () {
        this.tasks.sort();
        this.pruneTasks();
        this.checkSelection();
        window.app_view.nav_view.update();
    },
    pruneTasks: function () {
        var that = this;
        var removing = _.reject(this.tasks.models, this.tasks.shouldInclude);
        _.each(removing, function (task) {
            that.$('tr[rel="' + task.get('_id') + '"]').fadeOut(function () {
                $(this).remove();
            });
        });
        this.tasks.remove(removing);
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
    reset: function () {
        this.$('.task-table tbody').html('');
        this.tasks.each(_.bind(this.addOne, this));
        window.app_view.nav_view.update();
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
                var task = new Task(utils.parseTask(text));
                task.save();
                if (this.tasks.shouldInclude(task)) {
                    this.tasks.add(task);
                }
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
            task.set({complete: true}, {silent: true});
            task.save(null, {
                wait: true,
                success: function () {
                    // ?
                },
                error: function (err) {
                    // TODO: show error message and reset complete attribute
                    console.error(['Error saving completed task', err]);
                }
            });
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
    },
    showEditModal: function (ev) {
        ev.preventDefault();
        if (this.modal) {
            this.modal.modal('hide').data('modal', null).remove();
            this.modal = null;
        }
        var selected = this.$('.task-table tr.selected');
        if (selected.length !== 1) {
            return false;
        }
        var task = this.tasks.get(selected.attr('rel'));

        var due = task.get('due');
        this.modal = $(templates['edit.html']({
            task: task.attributes,
            tags_pp: task.get('tags').join(', '),
            due_pp: due ? (new Date(due)).toString('yyyy-MM-dd'): ''
        }));
        this.modal.modal({
            backdrop: false
        });
        $('[name="due"]', this.modal).datepicker({
            dateFormat: 'yy-mm-dd'
        });
        var that = this;
        $('.btn-danger', this.modal).click(function () {
            ev.preventDefault();
            task.destroy({
                wait: true,
                success: function (model, response) {
                    that.modal.modal('hide');
                },
                error: function (model, response) {
                    // TODO: show error message
                }
            });
            return false;
        });
        $('.btn-close', this.modal).click(function (ev) {
            ev.preventDefault();
            that.modal.modal('hide');
            return false;
        });
        function submitHandler(ev) {
            ev.preventDefault();
            var props = {
                priority:    $('[name="priority"]', that.modal).val(),
                description: $('[name="description"]', that.modal).val(),
                tags:        $('[name="tags"]', that.modal).val(),
                due:         $('[name="due"]', that.modal).val(),
                complete:    $('[name="complete"]', that.modal).is(':checked')
            };

            props.tags = props.tags ? props.tags.split(','): [];
            props.tags = _.compact(_.map(props.tags, function (t) {
                t = t.replace(/^\s+/, '').replace(/\s+$/, '');
                return t || null;
            }));

            if (props.priority) {
                props.priority = parseInt(props.priority, 10);
                if (isNaN(props.priority)) {
                    // TODO
                }
            }
            else {
                props.priority = null;
            }

            // TODO: validation

            task.set(props, {silent: true});

            task.save(null, {
                wait: true,
                success: function (model, response) {
                    that.modal.modal('hide');
                },
                error: function (model, response) {
                    // TODO: show error message
                    console.log(['task.save error', model, response]);
                }
            });
            return false;
        }
        $('.btn-primary', this.modal).click(submitHandler);

        // have to fake form-submits inside modals because boostrap eats up
        // the submit event
        $('input', this.modal).keyup(function (ev) {
            if (ev.keyCode === 13) {
                submitHandler(ev);
            }
        });

        return false;
    }
});
