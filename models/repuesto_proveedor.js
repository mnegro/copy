var mongoose =  require('mongoose');
var Schema =    mongoose.Schema;

var repuesto_proveedorSchema = new Schema({

    repuesto: { type: Schema.Types.ObjectId,    ref: 'Repuesto',  required: [true, 'Ingrese repuesto']},
    proveedor: { type: Schema.Types.ObjectId,    ref: 'Proveedor',  required: [true,'Ingrese proveedor']},
    cantidad: {    type: Number,   required: [true,    'La cantidad es  necesaria'] },
    costoUnidad: {   type: Number,   required: [true,    'El costo es necesario'] },
    costoTotal: {    type: Number,   required: false },
    fechaCompra: { type: Date,    required: [true, 'Ingrese fecha']},
   
});
module.exports =	mongoose.model('repuesto_proveedor', repuesto_proveedorSchema);