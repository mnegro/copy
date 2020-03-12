var mongoose =	require('mongoose');
var Schema =	mongoose.Schema;

var proveedorSchema =	new Schema({

	empresa: {	type: String,	required: [true,	'El	nombre	es	necesario']	},
    cuit: {	type: String,	required: false	},
    localidad: { type: String,	required: false	},
    direccion: { type: String,	required: false	},
    email: { type: String, unique: true, required: false },
   
});

module.exports =	mongoose.model('Proveedor',	proveedorSchema);