exports.incomplete_by_tag_due_and_priority = {
    map: function (doc) {
        if (doc.type === 'task' && !doc.complete && doc.due) {
            emit([null, doc.due || {}, doc.priority || 4]);
            if (doc.tags) {
                for (var i = 0; i < doc.tags.length; i++) {
                    emit([doc.tags[i], doc.due || {}, doc.priority || 4]);
                }
            }
        }
    }
};

exports.incomplete_by_tag_priority_and_due = {
    map: function (doc) {
        if (doc.type === 'task' && !doc.complete) {
            emit([null, doc.priority || 4, doc.due || {}]);
            if (doc.tags) {
                for (var i = 0; i < doc.tags.length; i++) {
                    emit([doc.tags[i], doc.priority || 4, doc.due || {}]);
                }
            }
        }
    }
};

exports.complete_by_tag_and_completed_at = {
    map: function (doc) {
        if (doc.type === 'task' && doc.complete) {
            emit([null, doc.priority || 4, doc.due || {}]);
            if (doc.tags) {
                for (var i = 0; i < doc.tags.length; i++) {
                    emit([doc.tags[i], doc.priority || 4, doc.due || {}]);
                }
            }
        }
    }
};

exports.nav_info = {
    map: function (doc) {
        // hacky way to load date.js
        require('views/lib/date');

        if (doc.type !== 'task') {
            return;
        }

        function emitCount(subset) {
            emit([null, subset], 1);
            for (var i = 0, len = doc.tags.length; i < len; i++) {
                emit([doc.tags[i], subset], 1);
            }
        }

        // for top-level counts for each tag (or all)
        emitCount('all');

        // subset counts
        if (doc.complete) {
            emitCount('complete');
        }
        else {
            emitCount('incomplete');
        }

        var t = Date.today();
        var today = t.toISOString();
        var tomorrow = t.clone().add({days: 1}).toISOString();
        var next_week = t.clone().add({weeks: 1}).toISOString();

        if (doc.due < today) {
            emitCount('overdue');
        }
        if (doc.due >= today && doc.due < tomorrow) {
            emitCount('today');
        }
        if (doc.due >= today && doc.due < next_week) {
            emitCount('week');
        }
    },
    reduce: function (keys, values, rereduce) {
        return sum(values);
    }
};
