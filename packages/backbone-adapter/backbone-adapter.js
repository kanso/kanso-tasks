var db = require('db'),
    Backbone = require('backbone'),
    _ = require('underscore')._;


exports.find = function (db, model, callback) {
    db.getDoc(model.attributes._id, callback);
};

exports.findAll = function (db, model, callback) {
    var view = model.view;
    if (!view) {
        return callback('No view defined');
    }
    if (!view.ddoc) {
        return callback('Missing design doc name');
    }
    if (!view.name) {
        return callback('Missing view name');
    }
    if (!view.query) {
        view.query = {};
    }
    // backbone-adapter always needs the whole doc
    view.query.include_docs = true;

    db.getView(view.ddoc, view.name, view.query, function (err, data) {
        if (err) {
            return callback(err);
        }
        var docs = _.map(data.rows, function (row) {
            return row.doc;
        });
        callback(null, docs);
    });
};

exports.save = function (db, model, callback) {
    db.saveDoc(model.attributes, function (err, resp) {
        if (err) {
            return callback(err);
        }
        model.attributes._id = resp.id;
        model.attributes._rev = resp.rev;
        callback(null, model.attributes);
    });
};

exports.remove = function (db, model, callback) {
    db.removeDoc(model.attributes, callback);
};

exports.sync = function (method, model, options) {
    var db_url = model.db;
    if (!db_url && model.collection) {
        // try collection db url
        db_url = model.collection.db;
    }
    if (!db_url) {
        // use app-wide db url
        db_url = Backbone.db;
    }
    var callback = function (err) {
        if (err) {
            return options.error(model, err);
        }
        var args = Array.prototype.slice.call(arguments, 1);
        options.success.apply(model, args);
    };
    if (!db_url) {
        return callback(
            new Error("DB not defined")
        );
    }
    var actions = {
        'read': model._id ? exports.find: exports.findAll,
        'create': exports.save,
        'update': exports.save,
        'delete': exports.remove
    };
    if (!actions[method]) {
        return callback(
            new Error('Unknown method: ' + method)
        );
    }
    actions[method](db.use(db_url), model, callback);
};
