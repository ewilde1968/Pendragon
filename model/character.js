/*
 * Character model
*/
var Character, require, module; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Skill = require('./skill'),
    TimelineEvent = require('./timelineevent');

var CharacterSchema = new Schema({
    name:           { type: String, required: true, index: true },
    profession:     { type: String, required: true },
    age:            Number,
    health:         Number,
    body:           Number,
    mind:           Number,
    soul:           Number,
    honor:          Number,
    skills:         [Skill.schema],
    armor:          String,
    shield:         Boolean,
    horses:         [{name: String, breed: String, barding: String, health: Number}],
    queuedEvents:   [TimelineEvent.schema]
}, {collection: 'characters', discriminatorKey: '_type' });



CharacterSchema.statics.factory = function (template) {
    "use strict";
    var result = new Character(template);
    this.initialize();

    return result;
};

CharacterSchema.methods.initialize = function () {
    "use strict";
    if (!this.mind || !this.body || !this.soul) {
        this.generateStats();   // TODO find inheretance pattern
    }
    
    return this;
};

CharacterSchema.methods.generateStats = function () {
    "use strict";
    var focus = Math.floor(Math.random() * 5);
    switch (focus) {
    case 0: // ectomorph
        this.body = 3;
        this.mind = 5;
        this.soul = 4;
        this.skills.push(Skill.factory({name: 'Learning', level: 3}));
        break;
    case 1: // mesomorph
        this.body = 5;
        this.mind = 3;
        this.soul = 4;
        this.skills.push(Skill.factory({name: 'Brawling', level: 3}));
        break;
    case 2: // spiritual ascetic
        this.body = 3;
        this.mind = 4;
        this.soul = 5;
        this.skills.push(Skill.factory({name: 'Orate', level: 3}));
        break;
    case 3: // spiritual dunce
        this.body = 4;
        this.mind = 3;
        this.soul = 5;
        this.skills.push(Skill.factory({name: 'Religion', level: 3}));
        break;
    case 4: // balance
        this.body = 4;
        this.mind = 4;
        this.soul = 4;
        this.skills.push(Skill.factory({name: 'Religion', level: 3}));
        break;
    }

    this.health = this.body;
    
    return this;
};


CharacterSchema.methods.fatherHistory = function () {
    "use strict";
    return new TimelineEvent({
        title: 'Tragedy!',
        message: "Your father died.",
        results: [{label: 'Done', action: 'log'}]
    });
};

CharacterSchema.methods.satisfies = function (requirements) {
    "use strict";
    return true;    // TODO
};

CharacterSchema.methods.getEvents = function (turn, result) {
    "use strict";
    var index,
        e;

    if (this.queuedEvents && this.queuedEvents.length > 0) {
        for (index = 0; index < this.queuedEvents.length; index += 1) {
            e = this.queuedEvents[index];
            if ((!e.year || e.year === turn.year)
                    && (!e.quarter || e.quarter === turn.quarter)
                    && this.satisfies(e.requirements)) {
                if (!result) {
                    this.queuedEvents.splice(index, 1);
                    index -= 1;
                } else {
                    result.push(e);
                }
            }
        }
    }
    
    return this;
};

CharacterSchema.methods.mergeOptions = function (options) {
    "use strict";
    var prop,
        setExperience = function (s) {
            if (options.experience.indexOf(s.name) !== -1) {s.experience = true; }
        };
    for (prop in options) {
        if (options.hasOwnProperty(prop)) {
            switch (prop) {
            case 'experience':
                this.skills.forEach(setExperience);
                break;
            case 'name':
            case 'age':
            case 'profession':
            case 'health':
            case 'body':
            case 'mind':
            case 'spirit':
            case 'honor':
                this[prop] = options[prop];
                break;
            default:
                break;
            }
        }
    }
    
    return this;
};

CharacterSchema.methods.increaseAge = function () {
    "use strict";
    this.age += 1;
    if (this.age === 15) {
        switch (this.profession) {
        case 'Child':
            // child to lady or squire
            break;
        default:
            break;
        }
    } else if (this.age === 21) {
        // coming of age
        switch (this.profession) {
        case 'Knight':
            // squire to knighthood test and events
        case 'Squire':
        case 'Lady':
        case 'Steward':
            break;
        default:
            break;
        }
    } else if (this.age > 40) {
        // do some aging
    }
    
    return this;
};


var Character = mongoose.model('Character', CharacterSchema);
module.exports = Character;
