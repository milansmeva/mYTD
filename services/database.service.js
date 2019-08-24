module.exports = (function () {
    var Datastore = require('nedb');
    var db = new Datastore({ filename: 'db.store' });
    db.loadDatabase();
    return function () {
        function saveData(data) { 
        }

        return {saveData};

    }
})();