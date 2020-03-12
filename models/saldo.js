var mongoose =	require('mongoose');
var Schema =	mongoose.Schema;

var saldoSchema =	new Schema({
  
    fecha: {	type: String,	required: [true,	'La fecha es necesaria'] },
    importeTotal: { type: Number, required: [true, 'Especifique el monto total'] },
    pago:[],
    cliente: { type: Schema.Types.ObjectId,    ref: 'Cliente',  required: true},
    disponible: { type: Boolean, default: true, required:false }
});

module.exports =	mongoose.model('Saldo',	saldoSchema);