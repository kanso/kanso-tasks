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
        due: due,
        priority: priority,
        description: description
    };
};
