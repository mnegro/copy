var mongoose =	require('mongoose');
var Schema =	mongoose.Schema;

var repuestoSchema =	new Schema({

    codigo: {	type: String,	required: false	},
    tipo: { type: String, required: [true, 'Ingrese el tipo de repusto'] },
    marca: { type: String, required:false },
    condicion: { type: String, required: [true, 'Nuevo o Usado?'] },
    detalle: {	type: String,	required: [true,	'El	Detalle es necesario']	},
    costo: {	type: Number,	required: false	},
    porcAplicado: {	type: Number,	required: false	},
    precio: {	type: Number,	required: false	},
    stock: { type: Number,	required: [true, 'El stock es necesario']	},
    stockMinimo: { type: Number,	required: false	},    
    duracion: { type: Number,	required: false	},   
    eliminado: { type: Boolean,	required: false,default: false	},
    proveedor: { type: Schema.Types.ObjectId,    ref: 'Proveedor',  required: false }
   
});

module.exports =	mongoose.model('Repuesto',	repuestoSchema);