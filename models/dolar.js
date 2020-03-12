var mongoose =	require('mongoose');
var Schema =	mongoose.Schema;

var dolarSchema =	new Schema({

	valor: { type: Number,	required: [true,	'El	Valor es necesario'] },
  
});

module.exports =	mongoose.model('Dolar',	dolarSchema);