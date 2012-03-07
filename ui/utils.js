var _ = require('underscore');


exports.trim = function (str) {
    return str.replace(/^\s+/, '').replace(/\s+$/, '');
};

exports.parseTask = function (str) {
    var task = {};

    str = exports.trim(str);

    var priority = null, m;
    while (m = /!([123])/.exec(str)) {
        priority = parseInt(m[1], 10);
        str = str.substr(0, m.index) + str.substr(m.index + m[0].length);
        str = exports.trim(str);
    }

    // extract due date
    var words = str.split(/ +/),
        datestr = '',
        w = null,
        due = null,
        nextdue = null;

    while (nextdue = Date.parse(datestr + (w = words.pop()))) {
        // TODO: check what's getting parsed!
        datestr += (datestr ? ' ': '') + w;
        due = nextdue;
    }

    // add last failing word back onto words array
    words.push(w);

    // use remaining text as description
    var description = words.join(' ');

    return {
        due: due.toISOString(),
        priority: priority,
        description: description
    };
};


/**
 * Requires Date.js library
 * http://datejs.com
 */

exports.prettyPrintDate = function (d) {
    if (!d) {
        return '';
    }
    if (!_.isDate(d)) {
        d = new Date(d);
    }
    var today = Date.today();
    var yesterday = today.clone().add({days: -1});
    var tomorrow  = today.clone().add({days: 1});
    var next_week = today.clone().add({weeks: 1});

    if (d < today && d >= yesterday) {
        return 'Yesterday';
    }
    if (d >= today && d < tomorrow) {
        return 'Today';
    }
    if (d >= tomorrow && d < tomorrow.clone().add({days: 1})) {
        return 'Tomorrow';
    }
    if (d >= today && d < next_week) {
        return d.toString('ddd');
    }
    if (d.toString('yyyy') === today.toString('yyyy')) {
        return d.toString('MMM dd');
    }
    return d.toString('d');
};
