var mongoose =	require('mongoose');
var Schema =	mongoose.Schema;

var clienteSchema =	new Schema({

	razonSocial: {	type: String,	required: [true, 'La razon social es necesaria']},
	nombre: {	type: String,	required: [true,	'El	nombre	es	necesario']	},
	apellido: {	type: String,	required: [true,	'El	apellido es necesario']	},
    cuit: {	type: String,	required: false	},
    localidad: { type: String,	required: false	},
    direccion: { type: String,	required: false	},
    email: { type: String, unique: true, required: false },
   
});

module.exports =	mongoose.model('Cliente',	clienteSchema);