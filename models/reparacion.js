var mongoose =  require('mongoose');
var Schema =    mongoose.Schema;
var Maquina = mongoose.model('Maqina');

var reparacionSchema = new Schema({

    fecha: {    type: String,   required: false },
    contador: {   type: String,   required: false },
    descripcion: {    type: String,   required: [true, 'Detalle la reparacion']},
    limpModulo: { type: Boolean,  default:false },
    limpOptica: { type: Boolean,  default:false },
    facturada: { type: Boolean, default:false},
    maquina: { type: Schema.Types.ObjectId,    ref: 'Maqina',  required: [true, 'Debe indicar la maquina a reparar']},
    modulo: { type: Schema.Types.ObjectId,    ref: 'Modulo',  required:false},
    total: { type: Number },
    repuestos: [{
       _id: { type: String, required: false },
       tipo: { type: String, required: false },
       detalle: { type: String, required: false },
       condicion: { type: String, required: false },
       cantidad: { type: Number, required: false },
       precio: { type: Number, required: false }
    }]
});
module.exports =	mongoose.model('Reparacion',	reparacionSchema);