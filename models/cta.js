var mongoose =	require('mongoose');
var Schema =	mongoose.Schema;

var ctaSchema =	new Schema({

	total: {	type: Number,	required: [true,	'El	nombre	es	necesario']	},
    cliente: { type: Schema.Types.ObjectId,    ref: 'Cliente',  required: false }

   
});

module.exports =	mongoose.model('cta',	ctaSchema);