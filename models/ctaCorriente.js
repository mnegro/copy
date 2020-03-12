var mongoose =	require('mongoose');
var Schema =	mongoose.Schema;

var ctaCorrienteSchema =	new Schema({

	total: {	type: String,	required: [true,	'El	nombre	es	necesario']	},
    cliente: { type: Schema.Types.ObjectId,    ref: 'Cliente',  required: false }

   
});

module.exports =	mongoose.model('ctaCorriente',	ctaCorrienteSchema);