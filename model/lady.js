/*
 * Lady model
*/
var Lady, require, module; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Skill = require('./skill'),
    Character = require('./character');

var LadySchema = Character.schema.extend({
});


LadySchema.statics.factory = function (template, firstKnight) {
    "use strict";
    var result = new Lady(template);
    result.initialize();

    result.profession = 'Lady';

    if (!template.age) {result.age = 16; }
    result.soul += 1;
    result.body -= 1;
    result.honor = 4;
    result.skills.push(Skill.factory({name: 'Stewardry', level: 3}));

    return result;
};

LadySchema.methods.increaseAge = function () {
    "use strict";
    this.age += 1;
    if (this.age >= 38) {
        // menopause
    }
    
    return this;
};


var Lady = mongoose.model('Lady', LadySchema);
module.exports = Lady;
