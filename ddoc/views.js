exports.types = {
    map: function (doc) {
        if (doc.type) {
            emit([doc.type], null);
        }
    }
};

exports.tasks = {
    map: function (doc) {
        if (doc.type === 'task') {
            emit([doc.list, doc.priority || 4, doc.due || {}]);
        }
    }
};

exports.incomplete_by_due_and_priority = {
    map: function (doc) {
        if (doc.type === 'task' && !doc.complete && doc.due) {
            emit([doc.due, doc.priority]);
        }
    }
};

exports.incomplete_by_priority_and_due = {
    map: function (doc) {
        if (doc.type === 'task' && !doc.complete) {
            emit([doc.priority || 4, doc.due || {}]);
        }
    }
};

exports.complete_by_completed_at = {
    map: function (doc) {
        if (doc.type === 'task' && doc.complete) {
            emit([doc.priority || 4, doc.due || {}]);
        }
    }
};
