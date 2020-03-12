var mongoose =  require('mongoose');
var Schema =    mongoose.Schema;
var Maquina = mongoose.model('Maqina');

var moduloSchema = new Schema({

    codigo: {    type: String,   required: false },
    contador: {   type: Number,   required: false },
    descripcion: {    type: String,   required: [true, 'Detalle la reparacion']},
    limpModulo: { type: Boolean,  default:false },
    maquina: { type: Schema.Types.ObjectId,    ref: 'Maqina',  required: false},
    ingreso:{   type: Number,   required: false },
    egreso:{   type: Number,   required: false },
    repuestos: [{
       _id: { type: String, required: false },
       tipo: { type: String, required: false },
       detalle: { type: String, required: false },
       condicion: { type: String, required: false },
       cantidad: { type: Number, required: false },
       precio: { type: Number, required: false }
    }]
});
module.exports =	mongoose.model('Modulo', moduloSchema);