exports.types = {
    map: function (doc) {
        if (doc.type) {
            emit([doc.type], null);
        }
    }
};
