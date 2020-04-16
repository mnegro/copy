var mongoose =	require('mongoose');
var Schema =	mongoose.Schema;

var insumoSchema =	new Schema({

    codigo: {	type: String,	required: false	},
    tipo: { type: String, required: [true, 'Ingrese el tipo de repusto'] },
    marca: { type: String, required:false },
    detalle: {	type: String,	required: [true,	'El	Detalle es necesario']	},
    costo: {	type: Number,	required: false	},
    stockMinimo: { type: Number,	required: false	},    
	porcAplicado: {	type: Number,	required: false	},
    precio: {	type: String,	required: false	},
    stock: { type: Number,	required: [true, 'El stock es necesario']	},
    eliminado: { type: Boolean,	required: false,default: false	},
    proveedor: { type: Schema.Types.ObjectId,    ref: 'Proveedor',  required: false }
   
});

module.exports =	mongoose.model('Insumo', insumoSchema);