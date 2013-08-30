/*
 * Court model
*/
/*global export, require, module */

var Court; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Family = require('./family'),
    Locale = require('./locale'),
    Character = require('./character'),
    Knight = require('./knight'),
    Storyline = require('./storyline');

var CourtSchema = new Schema({
    year:           Number,
    season:         String,
    name:           String,
    invitation:     String,
    presiding:      {type: ObjectId, ref: 'Character'},
    presidingObj:   Object,
    locale:         [{type: ObjectId, ref: 'Locale'}],
    localeObj:      Object,
    guests:         [{type: ObjectId, ref: 'Character'}],
    guestsObj:      Object,
    news:           Object,
    gossip:         [String],
    intrigue:       {Fumble: String, Success: String, 'Critical Success': String},
    schedule:       Object
});


CourtSchema.statics.factory = function (template, game, cb) {
    "use strict";
    var result = new Court({
            year: template.year,
            season: template.season,
            name: template.name,
            intrigue: template.intrigue,
            schedule: template.schedule
        }),
        doneGuests = !template.guests,
        doneNews = !template.news,
        complete = function () {
            if (doneNews && doneGuests) {
                result.save(cb);
            }
        };

    if (game) {
        // this is a live court object instead of a template from the database
        result.addGuestList(template, game, function () {
            result.populate({path: 'guests presiding', model: 'Character'}, function (err, court) {
                if (err) {return err; }

                court.addNews(template);
            
                doneNews = true;
                complete();
            });

            doneGuests = true;
            complete();
        });
    } else {
        result.presidingObj = template.presiding;
        result.guestsObj = template.guests;
        result.localeObj = template.locale;
        result.news = template.news;

        doneGuests = true;
        doneNews = true;
        complete();
    }
    
    return result;
};

CourtSchema.methods.addNews = function (template) {
    "use strict";
    var that = this,
        newNews = {};
    
    if (that.presiding && template.news) {
        newNews[that.presiding.id] = template.news;
    }
    
    if (template.guestsObj) {
        that.guests.forEach(function (g, i) {
            var lookup = template.guestsObj[g.name];
            if (lookup) {newNews[g.id] = lookup; }
        });
    }

    that.news = newNews;
    
    return this;
};

CourtSchema.methods.doSchedule = function (template) {
    "use strict";
    // A schedule contains different options for each day's morning and evening time slots.
    // The user can opt any activity listed as available, or opt out of all activities, for
    // any given time slot.
    //
    // Each activity requires an opposed check against the listed statistic against the
    // listed difficulty. Results are events queued for the next season.
    // 
    // Example activities include:
    //      skill checks - Horse Race, Melee, Duel
    //      body checks - Hunting, Foot Race, Wrestling
    //      mind checks - Socialize, Gaming
    //      soul checks - Temptation, Vigil
    //      honor checks - Knighting, Audience
};

CourtSchema.methods.addGuestList = function (template, game, cb) {
    "use strict";
    var that = this,
        presiding,
        locale = !that.locale,
        pf = game.playerFamily,
        guestLimit = 0,
        vassals = !template.guestsObj || !template.guestsObj.vassals,
        prop,
        complete = function () {
            if (0 === guestLimit && presiding && vassals && locale) {
                that.invitation = 'To be held at ' + locale + ', ' + presiding + ' presiding.';
                
                if (cb) {cb(); }
            }
        },
        findLocale = function (id) {
            Locale.findOne({landlord: id}, 'name', function (err, l) {
                if (err) {return err; }
                if (l) {
                    that.locale = l;
                    locale = l.name;
                    complete();
                } else {
                    throw {
                        name: 'invalid court object',
                        message: 'locale not properly set'
                    };
                }
            });
        },
        findPresiding = function (id) {
            Family.findById(id, 'rank patriarch', function (err, family) {
                if (err) {return err; }

                if (family) {
                    if (!vassals) {
                        Family.find({liege: family.id}, function (err, docs) {
                            if (err) {return err; }
                            
                            docs.forEach(function (doc) {
                                if (false === template.guestsObj[doc.name] && that.guests.indexOf(doc) !== -1) {
                                    // pull explicitly not appearing vassals
                                    that.guests.pull(doc);
                                } else if (doc.id !== pf && doc.patriarch) {
                                    // skip player family as player will make attendance decision
                                    that.guests.addToSet(doc.patriarch);
                                }
                            });

                            vassals = true;
                            complete();
                        });
                    }
                    
                    Knight.findById(family.patriarch, 'name', function (err, patriarch) {
                        if (err) {return err; }
                        
                        if (patriarch) {
                            that.presiding = patriarch;
                            
                            presiding = family.rank + ' ' + patriarch.name;
                            complete();
                        } else {
                            throw {
                                name: 'invalid court object',
                                message: 'cannot find presiding patriarch'
                            };
                        }
                    });
                } else {
                    throw {
                        name: 'invalid court object',
                        message: 'cannot find presiding family'
                    };
                }
            });
        },
        findGuest = function (name) {
            Character.findOne({game: game.id, name: name}, function (err, doc) {
                if (err) {return err; }

                if (doc) {
                    if (template.guestsObj[name]) {
                        that.guests.addToSet(doc);

                    } else if (that.guests.indexOf(doc) !== -1) {
                        that.guests.pull(doc);
                    }
                }   // skip the unfound characters
                
                guestLimit -= 1;
                complete();
            });
        };
    
    switch (template.presidingObj) {    // TODO specify locale
    case 'liege':
        Family.findById(pf, 'liege patriarch', function (err, f) {
            if (err) {return err; }
            

            if (f) {
                findPresiding(f.liege);
                findLocale(f.liege);
            } else {
                throw {
                    name: 'invalid court object',
                    message: 'cannot find player family'
                };
            }
        });
        break;
    case 'player':
        findPresiding(pf);
        findLocale(pf);
        break;
    case 'king':
        Family.findById(pf, function (err, family) {
            if (err) {return err; }

            if (family) {
                family.findKing(function (king) {
                    if (king) {
                        findPresiding(king);
                        findLocale(king);
                    } else {
                        throw {
                            name: 'invalid court object',
                            message: 'unable to find king of player family'
                        };
                    }
                });
            } else {
                throw {
                    name: 'invalid court object',
                    message: 'unable to find player family for king'
                };
            }
        });
        break;
    default:
    }
  
    if (template.guestsObj) {
        for (prop in template.guestsObj) {
            if (template.guestsObj.hasOwnProperty(prop)) {
                guestLimit += 1;
            
                switch (prop) {
                case 'vassals':
                    guestLimit -= 1;  // handled above
                    break;
                default:
                    findGuest(prop);
                    break;
                }
            }
        }
    }
    
    return this;
};

CourtSchema.methods.getEvents = function (game, result, cb) {
    "use strict";
    // events announcing a court that is yet to be held
    var that = this,
        storyline,
        ev = {
            title: that.name,
            message: that.invitation,
            actions: {log: true},
            choices: [
                {label: 'Go with entourage'},
                {label: 'Go with only squire'},
                {label: 'Refuse to attend'}
            ]
        },
        complete = function () {
            if (storyline) {
                result.push(storyline);
                
                that.populate({path: 'guests presiding', model: 'Character'}, function (err, doc) {
                    if (err) {return err; }
                    if (cb) {cb(doc); }
                });
            }
        };
    
    storyline = Storyline.factory(ev);
    complete();
};

CourtSchema.methods.nextTurn = function (options, game, cb) {
    "use strict";
    // add any results to game event queue since the court event queue is to set up a coming court
};


var Court = mongoose.model('Court', CourtSchema);
module.exports = Court;
