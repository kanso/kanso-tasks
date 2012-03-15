var Backbone = require('backbone'),
    templates = require('handlebars').templates,
    db = require('db').current(),
    _ = require('underscore');


exports.NavigationView = Backbone.View.extend({
    id: 'navigation',
    tagName: 'div',
    template: templates['nav.html'],
    main: [
        {
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
        }/*,
        {
            text: 'Stats',
            href: '#stats',
            icon: 'signal',
            active: false,
        },
        {
            text: 'Help',
            href: '#help',
            icon: 'book',
            active: false,
        }*/
    ],
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
                        active: (
                            this.selected.tag === name &&
                            this.selected.subset === 'incomplete'
                        )
                    },
                    {
                        text: 'Overdue',
                        subset: 'overdue',
                        href: '#tag/' + name + '/overdue',
                        active: (
                            this.selected.tag === name &&
                            this.selected.subset === 'overdue'
                        )
                    },
                    {
                        text: 'Due today',
                        subset: 'today',
                        href: '#tag/' + name + '/today',
                        active: (
                            this.selected.tag === name &&
                            this.selected.subset === 'today'
                        )
                    },
                    {
                        text: 'Due 7 days',
                        subset: 'week',
                        href: '#tag/' + name + '/week',
                        active: (
                            this.selected.tag === name &&
                            this.selected.subset === 'week'
                        )
                    },
                    {
                        text: 'Complete',
                        subset: 'complete',
                        href: '#tag/' + name + '/complete',
                        active: (
                            this.selected.tag === name &&
                            this.selected.subset === 'complete'
                        )
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
    updateTagCount: function (tag, counts) {
        for (var i = 0; i < this.tags.length; i++) {
            if (this.tags[i].tag === tag) {
                this.tags[i].count = counts.incomplete || 0;
                this.tags[i].children[0].count = counts.incomplete || 0;
                this.tags[i].children[1].count = counts.overdue || 0;
                this.tags[i].children[2].count = counts.today || 0;
                this.tags[i].children[3].count = counts.week || 0;
                this.tags[i].children[4].count = counts.complete || 0;
            }
        }
    },
    updateCounts: function (counts) {
        this.main[0].count = counts.incomplete || 0;
        this.main[0].children[0].count = counts.incomplete || 0;
        this.main[0].children[1].count = counts.overdue || 0;
        this.main[0].children[2].count = counts.today || 0;
        this.main[0].children[3].count = counts.week || 0;
        this.main[0].children[4].count = counts.complete || 0;

        for (var t in counts.tags) {
            this.updateTagCount(t, counts.tags[t]);
        }
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
            that.updateCounts(counts);
            that.render();
        });
    }
});
