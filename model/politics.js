/*
 * Politics model
*/
/*global export, require, module */
var Politics, relationshipValidator; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Family = require('./family'),
    Storyline = require('./storyline');

var PoliticsSchema = new Schema({
    family:         { type: ObjectId, ref: 'Family' },
    relationship:   { type: Number, index: true, validator: relationshipValidator },
    quest:          [Storyline.schema]
});


PoliticsSchema.statics.descriptionString = ['Fued', 'Enemy', 'Angry', 'Neutral', 'Friendly', 'Allied', 'Fealty'];


var relationshipValidator = function (val) {
    "use strict";
    if ('number' !== typeof val || val < 0 || val >= Politics.descriptionString.length) {
        return false;
    }

    return true;
};

PoliticsSchema.statics.factory = function (template) {
    "use strict";
    var result = new Politics({
        family:         template.family,
        relationship:   template.relationship || 3
    });

    return result;
};

PoliticsSchema.methods.changeRelationship = function (newRelationship) {
    "use strict";
    var that = this;
    
    this.relationship = newRelationship;
    
    return this;
};

PoliticsSchema.methods.nextTurn = function (options, game, cb) {
    "use strict";
    var that = this;
};

var Politics = mongoose.model('Politics', PoliticsSchema);
module.exports = Politics;
