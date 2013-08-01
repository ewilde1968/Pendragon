/*
 * Feast model
*/
var Feast, require, module; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var FeastSchema = new Schema({
    name:           { type: String, required: true },
    cost:           Number,
    hate:           Number,
    season:         String,
    message:        String,
    results:        []
});


FeastSchema.statics.factory = function (template) {
    "use strict";
    var result = new Feast({name: template.name,
                            cost: template.cost || 0,
                            hate: template.hate || 0,
                            season: template.season || null,
                            message: template.message || '',
                            results: template.results || null
                           });
    
    return result;
};


var Feast = mongoose.model('Feast', FeastSchema);
module.exports = Feast;
