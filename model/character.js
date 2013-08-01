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
});


var generateStats = function (character) {
    "use strict";
    var focus = Math.floor(Math.random() * 5);
    switch (focus) {
    case 0: // ectomorph
        character.body = 3;
        character.mind = 5;
        character.soul = 4;
        character.skills.push(Skill.factory({name: 'Learning', level: 3}));
        break;
    case 1: // mesomorph
        character.body = 5;
        character.mind = 3;
        character.soul = 4;
        character.skills.push(Skill.factory({name: 'Brawling', level: 3}));
        break;
    case 2: // spiritual ascetic
        character.body = 3;
        character.mind = 4;
        character.soul = 5;
        character.skills.push(Skill.factory({name: 'Orate', level: 3}));
        break;
    case 3: // spiritual dunce
        character.body = 4;
        character.mind = 3;
        character.soul = 5;
        character.skills.push(Skill.factory({name: 'Religion', level: 3}));
        break;
    case 4: // balance
        character.body = 4;
        character.mind = 4;
        character.soul = 4;
        character.skills.push(Skill.factory({name: 'Religion', level: 3}));
        break;
    }
};

CharacterSchema.statics.factory = function (template, firstKnight) {
    "use strict";
    var result = new Character(template);
    if (!template.mind || !template.body || !template.soul) {
        generateStats(result);
    }

    if (firstKnight) {
        result.queuedEvents.push(result.fatherHistory());
    }

    switch (result.profession) {
    case 'Knight':
        if (!template.age) {result.age = 21; }
        result.soul -= 1;
        result.body += 1;
        result.honor = 5;
        result.skills.push(Skill.factory({name: 'Swordsmanship', level: 3}));
        result.skills.push(Skill.factory({name: 'Horsemanship', level: 3}));
        result.skills.push(Skill.factory({name: 'Spear', level: 3}));
        result.armor = 'Chain Hauberk';
        result.shield = true;
        break;
    case 'Lady':
        if (!template.age) {result.age = 16; }
        result.soul += 1;
        result.body -= 1;
        result.honor = 4;
        result.skills.push(Skill.factory({name: 'Stewardry', level: 3}));
        break;
    case 'Squire':
        // will add to body, skills and honor when they reach 21
        if (!template.age) {result.age = 16; }
        result.soul -= 1;
        result.honor = 4;
        result.skills.push(Skill.factory({name: 'Swordsmanship', level: 1}));
        result.skills.push(Skill.factory({name: 'Horsemanship', level: 1}));
        result.skills.push(Skill.factory({name: 'Spear', level: 1}));
        break;
    case 'Steward':
        if (!template.age) {result.age = 21; }
        result.honor = 4;
        result.skills.push(Skill.factory({name: 'Stewardry', level: 3}));
        result.skills.push(Skill.factory({name: 'Swordsmanship', level: 1}));
        result.skills.push(Skill.factory({name: 'Horsemanship', level: 1}));
        result.skills.push(Skill.factory({name: 'Spear', level: 1}));
        break;
    default:
        throw 'Invalid Character profession setting';
    }

    result.health = result.body;

    return result;
};

CharacterSchema.methods.fatherHistory = function () {
    "use strict";
    return new TimelineEvent({
        year: 485,
        quarter: 'Winter',
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
    var character = this,
        index,
        e;

    if (this.queuedEvents && this.queuedEvents.length > 0) {
        for (index = 0; index < this.queuedEvents.length; index += 1) {
            e = this.queuedEvents[index];
            if ((!e.year || e.year === turn.year)
                    && (!e.quarter || e.quarter === turn.quarter)
                    && character.satisfies(e.requirements)) {
                if (!result) {
                    this.queuedEvents.splice(index, 1);
                    index -= 1;
                } else {
                    result.push(e);
                }
            }
        }
    }
};

CharacterSchema.methods.mergeOptions = function (options) {
    "use strict";
    var prop,
        setExperience = function (s) {
            if (options.experience.indexOf(s.name) !== -1) {s.experience = true; }
        };
    for (prop in options) {
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
};


var Character = mongoose.model('Character', CharacterSchema);
module.exports = Character;
