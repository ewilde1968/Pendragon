/*
 * Character model
*/
/*global export, require, module, console */

var Character; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Family = require('./family'),
    Statistic = require('./statistic'),
    Storyline = require('./storyline');


var decreptitudeYear = [];
decreptitudeYear[21] = +1;
decreptitudeYear[40] = -1;
decreptitudeYear[70] = -1;
decreptitudeYear[90] = -1;

// Character stats and skills are all 0-10
// A character stat is treated exactly as a skill for tests

var CharacterSchema = new Schema({
    name:           { type: String, required: true, index: true },
    game:           ObjectId,
    family:         { type: ObjectId, ref: 'Family', index: true },
    profession:     { type: String, required: true },
    age:            Number,
    bodyType:       String,
    health:         Number,
    body:           Number,
    mind:           Number,
    soul:           Number,
    honor:          Number,
    fertility:      Boolean,
    statistics:     [Statistic.schema],
    armor:          String,
    shield:         Boolean,
    horses:         [{name: String, breed: String, barding: String, health: Number}],
    parents:        [{type: ObjectId, ref: 'Character'}],
    spouse:         {type: ObjectId, ref: 'Character'},
    queuedEvents:   [Storyline.schema]
}, {collection: 'characters', discriminatorKey: '_type' });


CharacterSchema.statics.factory = function (template, game, family, cb) {
    "use strict";
    var result = new Character(template);
    this.initialize(template, game, family, cb);
    
    return result;
};

CharacterSchema.methods.initialize = function (template, game, famille, cb) {
    "use strict";
    var that = this;
    
    if (!template.mind || !template.body || !template.soul) {
        that.generateStats();   // TODO find inheretance pattern
    }
    
    if (template.age >= 14) {this.fertility = true; }
    
    if (game) {that.game = game; }
    if (famille) {
        if (famille.id) {
            that.family = famille.id;
            if (cb) {cb(that); }
        } else {
            // family must be a name
            Family.findOne({game: game, name: famille}, function (err, f) {
                if (err) {return err; }
                if (f) {that.family = f.id; }
                if (cb) {cb(that); }
            });
        }
    }
    
    return this;
};

CharacterSchema.methods.generateStats = function () {
    "use strict";
    var focus = Math.floor(Math.random() * 5);
    switch (focus) {
    case 0:
        this.bodyType = 'ectomorph';
        this.statistics.push(Statistic.factory({name: 'Body', level: 4}));
        this.statistics.push(Statistic.factory({name: 'Health', level: 4}));
        this.statistics.push(Statistic.factory({name: 'Mind', level: 7}));
        this.statistics.push(Statistic.factory({name: 'Soul', level: 5}));
        this.statistics.push(Statistic.factory({name: 'Learning', level: 3}));
        break;
    case 1:
        this.bodyType = 'mesomorph';
        this.statistics.push(Statistic.factory({name: 'Body', level: 7}));
        this.statistics.push(Statistic.factory({name: 'Health', level: 7}));
        this.statistics.push(Statistic.factory({name: 'Mind', level: 4}));
        this.statistics.push(Statistic.factory({name: 'Soul', level: 5}));
        this.statistics.push(Statistic.factory({name: 'Brawling', level: 3}));
        break;
    case 2:
        this.bodyType = 'leader';
        this.statistics.push(Statistic.factory({name: 'Body', level: 4}));
        this.statistics.push(Statistic.factory({name: 'Health', level: 4}));
        this.statistics.push(Statistic.factory({name: 'Mind', level: 5}));
        this.statistics.push(Statistic.factory({name: 'Soul', level: 7}));
        this.statistics.push(Statistic.factory({name: 'Leadership', level: 3}));
        break;
    case 3:
        this.bodyType = 'spiritual dunce';
        this.statistics.push(Statistic.factory({name: 'Body', level: 5}));
        this.statistics.push(Statistic.factory({name: 'Health', level: 5}));
        this.statistics.push(Statistic.factory({name: 'Mind', level: 4}));
        this.statistics.push(Statistic.factory({name: 'Soul', level: 7}));
        this.statistics.push(Statistic.factory({name: 'Religion', level: 3}));
        break;
    case 4: // balance
        this.bodyType = 'cygnus';
        this.statistics.push(Statistic.factory({name: 'Body', level: 5}));
        this.statistics.push(Statistic.factory({name: 'Health', level: 5}));
        this.statistics.push(Statistic.factory({name: 'Mind', level: 5}));
        this.statistics.push(Statistic.factory({name: 'Soul', level: 5}));
        this.statistics.push(Statistic.factory({name: 'Religion', level: 3}));
        break;
    }
    
    return this;
};

CharacterSchema.methods.satisfies = function (requirements) {
    "use strict";
    return true;    // TODO
};

CharacterSchema.methods.clearEvents = function (turn) {
    "use strict";
    var index;
    
    for (index = 0; index < this.queuedEvents.length; index += 1) {
        // do not filter by satisfies for removing events
        if (this.queuedEvents[index].filterByTurn(turn)) {
            this.queuedEvents.splice(index, 1);
            index -= 1;
        }
    }

    return this;
};

CharacterSchema.methods.getEvents = function (turn, result) {
    "use strict";
    // see which events match the current turn and return
    // an array of all such Storyline objects
    var that = this;
    
    if (!result) {
        result = [];
    }
    
    console.log("Character events for %s:", that.name);
    
    this.queuedEvents.forEach(function (e) {
        var actions;
        
        if (e.filterByTurn(turn, that.satisfies)) {
            if (e.actions) {
                actions = JSON.parse(e.actions);
                if ('Locale' === actions.target) {
                    actions.target = that.id;
                }
                e.actions = JSON.stringify(actions);
            }

            console.log('Event: %s', e.name);
            result.push(e);
        }
    });
    
    return result;
};

CharacterSchema.methods.mergeOptions = function (options) {
    "use strict";
    var that = this,
        prop,
        setExperience = function (s) {
            if (options.experience.indexOf(s.name) !== -1) {s.experience = true; }
        };
    for (prop in options) {
        if (options.hasOwnProperty(prop)) {
            switch (prop) {
            case 'experience':
                that.statistics.forEach(setExperience);
                break;
            case 'name':
            case 'age':
            case 'profession':
                that[prop] = options[prop];
                break;
            case 'Health':
            case 'Body':
            case 'Mind':
            case 'Spirit':
            case 'Honor':
                that.getStat(prop).level = options[prop];
                break;
            default:
                break;
            }
        }
    }
    
    return this;
};

CharacterSchema.methods.increaseAge = function (years) {
    "use strict";
    this.age += years || 1;

    // check to see if the body and health values change this year
    if (decreptitudeYear[this.age]) {
        this.body += decreptitudeYear[this.age];
        this.health += decreptitudeYear[this.age];  // TODO check for death as this.health setter
    }

    if (this.age >= 14) {this.fertility = true; }

    return this;
};

CharacterSchema.methods.increaseStat = function (name, value) {
    "use strict";
    var stat;
    
    this.statistics.forEach(function (s) {
        if (s.name === name) {
            stat = s;
        }
    });
    
    if (!stat) {
        stat = Statistic.factory({name: name, level: 0});
        this.statistics.push(stat);
    }
    
    stat.increase(value);
    
    return this;
};

CharacterSchema.methods.getStat = function (name) {
    "use strict";
    var result = null;
    this.statistics.forEach(function (s) {if (name === s.name) {result = s; } });
    
    return result;
};

CharacterSchema.methods.marriagable = function () {
    "use strict";
    return !this.spouse;
};

CharacterSchema.methods.dalliance = function (family, game, partnerId, cb) {
    "use strict";
    // no-op for most people
    if (cb) {cb(); }
};

CharacterSchema.methods.temptation = function (sin, family, game, data, cb) {
    "use strict";
    // data is different per sin
    var check = this.getStat('Soul').difficultyCheck(5),
        doCB = true;

    console.log('%s Temptation for %s', sin, this.name);
    
    switch (sin) {
    case 'Lust':
        if (this.fertility && (check === 'Failure' || check === 'Fumble')) {
            doCB = false;
            this.dalliance(family, game, data, cb);
        }
        break;
    case 'Gluttony':
        break;
    case 'Greed':
        break;
    case 'Sloth':
        break;
    case 'Wrath':
        break;
    case 'Envy':
        break;
    case 'Pride':
        break;
    default:
        throw {
            name: 'Invalid Temptation',
            message: sin + ' temptation for ' + this.name
        };
    }
    
    if (doCB && cb) {cb(); }
};

CharacterSchema.methods.cost = function (livingStandard) {
    "use strict";
    // ladies and squires are free
    // stewards count against their holding's costs
    
    // TODO not calling Knight's cost function?
    // See https://github.com/briankircho/mongoose-schema-extend/issues/11
    if (this.profession === 'Knight') {
        switch (livingStandard) {
        case 'Poor':
            return 1;
        case 'Normal':
            return 4;
        case 'Rich':
            return 8;
        case 'Opulent':
            return 12;
        default:
            throw {
                name: 'Invalid living standard',
                message: 'CharacterSchema.methods.cost for ' + this.name
            };
        }
    }

    return 0;
};

CharacterSchema.methods.marry = function (spouse, game, cb) {
    "use strict";
    var that = this,
        complete = function (partner) {
            that.spouse = partner.id;
            partner.family = that.family;
            that.populate({path: 'family', model: 'Family'}, function (err, cDoc) {
                if (err) {return err; }
                partner.dalliance(cDoc.family, game, that.id, cb);
            });
        };
    
    Character.findById(spouse, function (err, s) {
        if (err || !s) {
            // an err could be the result of spouse being a name instead of an Id
            Character.findOne({name: spouse, game: game.id}, function (err, sp) {
                if (err) {return err; }
                if (sp) {
                    complete(sp);
                } else {
                    throw {
                        name: 'Cannot find spouse',
                        message: that.name + ' cannot marry ' + spouse
                    };
                }
            });
        } else {
            complete(s);
        }
    });
};

CharacterSchema.methods.nextTurn = function (options, game, cb) {
    "use strict";
    var that = this,
        cost = 0,
        doneMarry = !options || !options.marry,
        doneSpouse = doneMarry && !that.spouse,
        doneYear = false,
        complete = function () {
            if (doneSpouse && doneMarry && doneYear) {
                that.save(function (err) {
                    if (err) {return err; }
                    if (cb) {cb(cost); }
                });
            }
        };
    
    console.log('Next turn for character %s', that.name);
    
    that.mergeOptions(options);
    that.clearEvents(game.turn);
    
    if (!doneMarry) {
        that.marry(options.marry, game, function () {
            doneMarry = true;
            complete();
        });
    }
    
    switch (game.turn.quarter) {
    case "Winter":
        doneSpouse = true;
        break;
    case "Spring":
        doneSpouse = true;
        break;
    case "Summer":
        if (that.spouse) {
            that.populate({path: 'family', model: 'Family'}, function (err, cDoc) {
                if (err) {return err; }
                cDoc.populate({path: 'spouse', model: 'Lady'}, function (err, c) {
                    if (err) {return err; }

                    if (c.spouse) {
                        c.spouse.dalliance(c.family, game, that.id, function () {
                            doneSpouse = true;
                            complete();
                        });
                    } else {
                        c.spouse = null;
                        doneSpouse = true;
                        complete();
                    }
                });
            });
        } else {doneSpouse = true; }
        break;
    case "Fall":
        // age each character a year
        that.increaseAge();

        // experience checks for all family members
        that.statistics.forEach(function (s) {s.experienceCheck(); });
        
        cost = that.cost();
            
        doneSpouse = true;
        break;
    default:
        break;
    }

    doneYear = true;
    complete();
};


var Character = mongoose.model('Character', CharacterSchema);
module.exports = Character;
