
/*
 * Game model
*/

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    defaultObjects = require('./../model/defaultObjects'),
    Memeplex = require('./memeplex'),
    Corporation = require('./corporation');

var GameSchema = new Schema( {
    owner:      { type:ObjectId, required:true },
    settings:   Object,
    state:      String,
    memeplexes: [Memeplex.schema],
    turn:       { year:Number, quarter:String }
});


GameSchema.statics.factory = function( settings, ownerId, cb) {
    var result = new Game({owner:ownerId,
                           settings:settings,
                           state:'initial',
                           turn:{year:2100,quarter:"New Year"}
                          });

    var takenCorps = new Array();
    defaultObjects.memeplexes.forEach( function(memeTemplate) {
        var m = Memeplex.factory(memeTemplate, settings);
        if(settings.memeplex == memeTemplate.name) {
            result.memeplexes.unshift( m);      // player's meme is always the zeroeth element

        } else
            result.memeplexes.push( m);

        if( !!memeTemplate.startingCorporationOdds && memeTemplate.startingCorporationOdds.length > 0) {
            var i = Math.floor(Math.random()*memeTemplate.startingCorporationOdds.length)
            do {
                var corpName = memeTemplate.startingCorporationOdds[i];
                if( takenCorps.indexOf( corpName) == -1) {
                    takenCorps.push( corpName);
                    var corp = Corporation.factory( corpName, 100);
                    if( corp)
                        m.corps.push( corp);
                }
                i = (i + 1) % memeTemplate.startingCorporationOdds.length;
            } while( m.corps.length < 1);
        }
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

    // Corporate and locale allocations to investments and propaganda
    this.memeplexes.forEach( function(m) {m.spendFunds();});

    // Timeline events
    this.timelineEvents();

    // Triggered propaganda and investment events
    this.memeplexes.forEach( function(m) {m.propagandaEvents();});
    this.memeplexes.forEach( function(m) {m.investmentEvents();});

    // end quarter
    this.memeplexes.forEach( function(m) {m.endQuarter();});

    if(cb) cb(err,this);
}


var Game = mongoose.model('Game', GameSchema);
module.exports = Game;
