
/*
 * Database mdoel
 */
/*global export, require, module */

var Database; // forward to clear out JSLint errors


var mongoose = require('mongoose'),
    defaultObjects = require('./defaultObjects'),
    Storyline = require('./storyline'),
    Court = require('./court');

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

        Storyline.findOne({name: 'Intro'}, function (err, doc) {
            if (err) {return err; }
            
            if (!doc) {
                // Items in the database include:
                //    - events
                var eventTree = [],
                    courtTree = [];
                
                defaultObjects.eventTree.forEach(function (e) {
                    eventTree.push(Storyline.factory(e));
                });
                Storyline.create(eventTree, function (err) {
                    if (err) {return err; }
                });
                
                //      - courts
                defaultObjects.courts.forEach(function (c) {
                    courtTree.push(Court.factory(c));
                });
                Court.create(courtTree, function (err) {
                    if (err) {return err; }
                });
            }
        });

        return that;
    };
    
    return that;
};

module.exports = database;