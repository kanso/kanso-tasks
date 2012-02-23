## Backbone Adapter

Uses CouchDB for storage, does not push extra design docs like
`backbone-couch`, leaving you in control of the views. Also uses
the `db` module instead of writing it's own client on top of jQuery.


### Usage

In your app initialization, set the db URL for your app and replace
the default Backbone sync function with the one provided by the adapter.

```javascript
var Backbone = require('backbone'),
    adapter = require('backbone-adapter');

Backbone.db = '/my/db/url';
Backbone.sync = adapter.sync;
```

Then, in your Collections, define the CouchDB view they relate to:

```javascript
exports.TestList = Backbone.Collection.extend({
    ...
    view: {
        ddoc: 'appname',
        name: 'types',
        query: {
            key: ['test']
        }
    }
});
```

This will fetch the view at
`/my/db/url/\_design/appname/\_view/types?key=%5B%22test%22%5D&amp;include_docs=true`
