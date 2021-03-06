var mongoose =	require('mongoose');
var Schema =	mongoose.Schema;
var Reparacion = mongoose.model('Reparacion');

var facturaSchema =	new Schema({

	fecha: {	type: String,	required: [true,	'El	nombre	es	necesario']	},
	detalle: [{
       contadorActual: { type: Number, required: false },
       cantidadCopias: { type: Number, required: false },
       precio: { type: Number, required: false },
       maquina: { type: Object, required: false }
    }],
    insumo: [{
        codigo: {	type: String,	required: false	},
        tipo: { type: String, required: [true, 'Ingrese el tipo de repusto'] },
        marca: { type: String, required:false },
        detalle: {	type: String,	required: [true,	'El	Detalle es necesario']	},
        precio: {	type: Number,	required: false	},
        cantidad: { type: Number, required: false } 

    }],
    paga: { type: Boolean, default: false },
    aCuenta: { type: Number, default:0, required:false },
    reparacion: [{ type: Schema.Types.ObjectId,    ref: 'Reparacion',  required: false }],
    cliente: { type: Object, required: [true, 'Es necesario el cliente'] }, 
    total: { type: Number, required: [true,'Es necesario el monto total' ] }
 
   
});

module.exports =	mongoose.model('Factura',	facturaSchema);

