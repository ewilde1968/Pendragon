/*
 * TimelineEvent model
*/

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var TimelineEventSchema = new Schema( {
    year:           { type:Number, required:true },
    quarter:        { type:String, required:true },
    requirements:   Object,
    message:        String
});


TimelineEventSchema.statics.factory = function( template, cb) {
    var result = new TimelineEvent({year:template.year,
                                    quarter:template.quarter,
                                    message:template.message
                                   });

    if(!!result && !!cb)
        cb(result);
    
    return result;
};


var TimelineEvent = mongoose.model('TimelineEvent', TimelineEventSchema);
module.exports = TimelineEvent;
