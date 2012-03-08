var Backbone = require('backbone'),
    templates = require('handlebars').templates,
    collections = require('./collections'),
    utils = require('./utils'),
    db = require('db').current(),
    _ = require('underscore');


exports.NavigationView = Backbone.View.extend({
    id: 'navigation',
    tagName: 'div',
    template: templates['nav.html'],
    main: [{
        text: 'All tasks',
        tag: null,
        href: '#all/incomplete',
        icon: 'asterisk',
        active: true,
        children: [
            {
                text: 'Incomplete',
                subset: 'incomplete',
                href: '#all/incomplete',
                active: true
            },
            {
                text: 'Overdue',
                subset: 'overdue',
                href: '#all/overdue',
                active: false
            },
            {
                text: 'Due today',
                subset: 'today',
                href: '#all/today',
                active: false
            },
            {
                text: 'Due 7 days',
                subset: 'week',
                href: '#all/week',
                active: false
            },
            {
                text: 'Complete',
                subset: 'complete',
                href: '#all/complete',
                active: false
            }
        ]
    }],
    tags: [],
    initialize: function () {
        this.el = $('#sidebar');
        this.render();
        this.update();
    },
    render: function () {
        $(this.el).html(this.template({
            main: this.main,
            tags: this.tags
        }));
        return this;
    },
    selectNav: function (tag, subset, /*optional*/obj) {
        this.selected = {tag: tag, subset: subset};
        if (!obj) {
            // by default update both main and tags navigation
            this.selectNav(tag, subset, this.main);
            this.selectNav(tag, subset, this.tags);
            return;
        }
        for (var i = 0, len = obj.length; i < len; i++) {
            var n = obj[i];
            if (n) {
                n.active = (n.tag === tag);
                if (n.children) {
                    for (var j = 0; j < n.children.length; j++) {
                        var c = n.children[j];
                        c.active = (n.tag === tag && c.subset === subset);
                    }
                }
            }
        }
        this.render();
    },
    hasTag: function (name) {
        return !!(_.find(this.tags, function (n) {
            return n.tag === name;
        }));
    },
    addTag: function (name) {
        if (!this.hasTag(name)) {
            this.tags.push({
                type: 'entry',
                icon: 'tag',
                text: name,
                tag: name,
                active: (this.selected.tag === name),
                href: '#tag/' + encodeURIComponent(name) + '/incomplete',
                children: [
                    {
                        text: 'Incomplete',
                        subset: 'incomplete',
                        href: '#tag/' + name + '/incomplete',
                        active: (this.selected.tag === name && this.selected.subset === 'incomplete')
                    },
                    {
                        text: 'Overdue',
                        subset: 'overdue',
                        href: '#tag/' + name + '/overdue',
                        active: (this.selected.tag === name && this.selected.subset === 'overdue')
                    },
                    {
                        text: 'Due today',
                        subset: 'today',
                        href: '#tag/' + name + '/today',
                        active: (this.selected.tag === name && this.selected.subset === 'today')
                    },
                    {
                        text: 'Due 7 days',
                        subset: 'week',
                        href: '#tag/' + name + '/week',
                        active: (this.selected.tag === name && this.selected.subset === 'week')
                    },
                    {
                        text: 'Complete',
                        subset: 'complete',
                        href: '#tag/' + name + '/complete',
                        active: (this.selected.tag === name && this.selected.subset === 'complete')
                    }
                ]
            });
            this.tags = _.sortBy(this.tags, function (t) {
                return t.text;
            });
        }
    },
    updateTags: function (names) {
        _.each(names, this.addTag, this);
    },
    update: function () {
        var that = this;
        var q = {
            reduce: true,
            group: true
        }
        db.getView('kanso-tasks', 'nav_info', q, function (err, data) {
            if (err) {
                return console.error(err);
            }
            var counts = {tags: {}};
            _.forEach(data.rows, function (r) {
                if (r.key[0] === null) {
                    counts[r.key[1]] = r.value;
                }
                else {
                    if (!counts.tags[r.key[0]]) {
                        counts.tags[r.key[0]] = {};
                    }
                    counts.tags[r.key[0]][r.key[1]] = r.value;
                }
            });
            that.updateTags(_.keys(counts.tags));
            that.render();
        });
    }
});


exports.AppView = Backbone.View.extend({
    el: $('#content'),
    template: templates['app.html'],
    initialize: function () {
        this.render();
        this.nav_view = new exports.NavigationView();
    },
    render: function () {
        $(this.el).html(this.template({}));
        return this;
    },
    showList: function (view) {
        this.list_view = new exports.ListView(view);
        this.$('#main').html(this.list_view.render().el);
    }
});

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

        this.tasks = new collections.TaskList(view);
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
        var view = new exports.TaskView({model: task});
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
        $(el).html(
            this.template(_.extend(
                { due_pp: this.model.due_pp() },
                this.model.attributes
            ))
        );
        if (this.model.get('priority')) {
            $(el).addClass('priority' + this.model.get('priority'));
        }
        if (this.model.get('complete')) {
            $(el).addClass('complete');
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
