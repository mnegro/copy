var mongoose =  require('mongoose');
var Schema =    mongoose.Schema;

var compraSchema = new Schema({

    fecha: { type: String,    required: [true, 'Ingrese fecha']},
    proveedor: { type: Schema.Types.ObjectId,    ref: 'Proveedor',  required: [true,'Ingrese proveedor']},
    repuestos:[{
        _id: { type: String, required: false },
        detalle: { type: String, required:false },
        tipo:  { type: String, required:false },
        cantidad: {    type: Number,   required: [true,    'La cantidad es  necesaria'] },
        costoUnidad: {   type: Number,   required: [true,    'El costo es necesario'] },
        subTotal: {   type: Number,   required: false },
    }],
    insumos:[{
            _id: { type: String, required: false },
            detalle: { type: String, required:false },
            tipo:  { type: String, required:false },
            cantidad: {    type: Number,   required: [true,    'La cantidad es  necesaria'] },
            costoUnidad: {   type: Number,   required: [true,    'El costo es necesario'] },
            subTotal: {   type: Number,   required: false },
        }],
    total: {   type: Number,   required: false },
    
   
});
module.exports =	mongoose.model('compra', compraSchema);