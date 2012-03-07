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
            emit([doc.list, doc.priority || 4, doc.due]);
        }
    }
};
