
/*
 * Game model
*/

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    defaultObjects = require('./../model/defaultObjects'),
    Family = require('./family');

var GameSchema = new Schema( {
    owner:      { type:ObjectId, required:true },
    settings:   Object,
    state:      String,
    families:   [Family.schema],
    turn:       { year:Number, quarter:String }
});


GameSchema.statics.factory = function( settings, ownerId, cb) {
    var result = new Game({owner:ownerId,
                           settings:settings,
                           state:'initial',
                           turn:{year:490,quarter:"New Year"}
                          });

    defaultObjects.families.forEach( function(memeTemplate) {
        var f = Family.factory(memeTemplate, settings);
        if(settings.family == f.name)
            result.families.unshift(f);      // player is always the zeroeth element
        else
            result.families.push(f);
    });

    result.update(cb);
};

GameSchema.methods.update = function(cb) {
    this.save( function(err,game) {
        if(cb) cb(err,game);
    });
};

GameSchema.methods.timelineEvents = function() {};  // TODO

GameSchema.methods.mergeOptions = function( options) {
    this.memeplexes[0].mergeOptions(options);
};

GameSchema.methods.nextTurn = function(cb) {
    var err = null;

    // end quarter
    this.families.forEach( function(f) {f.endQuarter();});

    if(cb) cb(err,this);
};


var Game = mongoose.model('Game', GameSchema);
module.exports = Game;
