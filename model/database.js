
/*
 * Database mdoel
 */
var Database, require, module; // forward to clear out JSLint errors


var mongoose = require('mongoose'),
    defaultObjects = require('./defaultObjects');

var connected = false;
var database = function (databaseName) {
    "use strict";
    var connected,
        that = {};

    if (!connected) {
        mongoose.connect('mongodb://127.0.0.1/' + databaseName);
    }
    connected = true;
    
    that.initialize = function () {
        // See if the database is setup properly and, if not, initialize. Default
        // game objects should either go into the database as a template or should
        // remain an object in memory as a template

        // Use memory and search in defaultObjects JSON object when:
        //    - Object is only infrequently loaded from template
        //    - Object is easy to find when walking through defaultObjects
        
        // Use database when:
        //    - Object is created regularly from template (leverage database cache)
        //    - Object is difficult to find when walking through defaultObjects
        
        return that;
    };
    
    return that;
};

module.exports = database;