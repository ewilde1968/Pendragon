/*
 * Feast model
*/
/*global export, require, module */

var Feast; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var FeastSchema = new Schema({
    name:           { type: String, required: true },
    cost:           Number
});


FeastSchema.statics.factory = function (template) {
    "use strict";
    var result = new Feast(template);
    
    return result;
};


var Feast = mongoose.model('Feast', FeastSchema);
module.exports = Feast;
