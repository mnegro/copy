//Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')

//Inicializar variables
var app = express();

//CORSE
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
  });
  

//body-parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const port = process.env.PORT || 3000;

//Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var clienteRoutes = require('./routes/cliente');
var maquinaRoutes = require('./routes/maqina');
var repuestoRoutes = require('./routes/repuesto');
var proveedorRoutes = require('./routes/proveedor');
var reparacionRoutes = require('./routes/reparacion');
var facturaRoutes = require('./routes/factura');
var saldoRoutes = require('./routes/saldo');
var ctaCorrienteRoutes = require('./routes/ctaCorriente');
var insumoRoutes = require('./routes/insumo');
var compraRoutes = require('./routes/compra');
var dolarRoutes = require('./routes/dolar');
var moduloRoutes = require('./routes/modulo');
var repModRoutes = require('./routes/repMod');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

//Conexion a base de datos
mongoose.connection.openUri('mongodb://localhost:27017/CopyWeb', (err, res) => {
   // en js throw detiene todo el proceso
    if (err) throw err;
    

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');

});

// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://maxi:gordini850@cluster0-wgw9q.mongodb.net/test?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

//Server index config
//var serveIndex = require('serve-index');
app.use(express.static(__dirname + '/client'))
//app.use('/uploads', serveIndex(__dirname + '/uploads'));


//Rutas
app.use('/medico', medicoRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/cliente', clienteRoutes);
app.use('/maqina', maquinaRoutes);
app.use('/repuesto', repuestoRoutes);
app.use('/proveedor', proveedorRoutes);
app.use('/reparacion', reparacionRoutes);
app.use('/factura', facturaRoutes);
app.use('/saldo', saldoRoutes);
app.use('/ctaCorriente', ctaCorrienteRoutes);
app.use('/insumo', insumoRoutes);
app.use('/compra', compraRoutes);
app.use('/dolar', dolarRoutes);
app.use('/modulo', moduloRoutes);
app.use('/repMod', repModRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);

app.use('/', appRoutes);

//Escuchar peticiones
app.listen(port, () => {
    console.log(`express puerto ${ port }: \x1b[32m%s\x1b[0m`, 'online');
})