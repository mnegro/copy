var mongoose =  require('mongoose');
var Schema =    mongoose.Schema;
var Cliente = mongoose.model('Cliente');

var maqinaSchema = new Schema({

    marca: {    type: String,   required: [true,    'La marca  es  necesaria'] },
    modelo: {   type: String,   required: [true,    'El modelo es necesario'] },
    serie: {    type: String,   required: false },
    alquilada: {    type: Boolean, required: [true,  'La marca  es  necesaria']},
    contador: {    type: Number,   required: false },
    precioCopia: {  type: Number,   required: false },
    descripcion: { type: String,    required: false },
    accesorios: { type: String, required: false },
    cliente: { type: Schema.Types.ObjectId,    ref: 'Cliente',  required: false }
});
module.exports =	mongoose.model('Maqina',	maqinaSchema);