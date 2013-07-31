/*
 * Investment model
*/
var Investment, require, module; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var InvestmentSchema = new Schema({
    name:           { type: String, required: true },
    income:         Number,
    cost:           Number,
    maintenance:    Number,
    defense:        Number,
    hate:           Number,
    built:          Boolean,
    damaged:        Boolean
});


InvestmentSchema.statics.factory = function (template) {
    "use strict";
    var result = new Investment({name: template.name,
                                 income: template.income || 0,
                                 cost: template.cost || 0,
                                 maintenance: template.maintenance || 0,
                                 defense: template.defense || 0,
                                 hate: template.hate || 0,
                                 built: template.built || false,
                                 damaged: template.damaged || false
                                });
    
    return result;
};


var Investment = mongoose.model('Investment', InvestmentSchema);
module.exports = Investment;
