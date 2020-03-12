var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();
//var Cta = require('../models/ctaCorriente');
var Cta = require('./cta');
var Saldo = require('../models/saldo');
//var CC = require('../models/ctaCorriente');
var CC = require('../models/cta');

//============================================================
// OBTENER TODOS LOS SALDOS
//============================================================
app.get('/paginado/:desde', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req, res, next) => {

    var desde = req.params.desde || 0;
    desde = Number(desde); 

    Saldo.find({})
    .skip(desde)
    .limit(7)
    .populate('cliente')
    .exec(
                (err, saldos)=>{

                if(err){
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Saldos',
                        errors: err
                    });
                }
            Saldo.count({},(err,conteo) =>{
                
                res.status(200).json({
                    ok: true,
                    saldos: saldos,
                    Total: conteo
                });
            })

            })

}); 
//============================================================
// OBTENER SALDOS DE UN CLIENTE
//============================================================
app.get('/cliente/paginado/:id', (req,res) =>{
    var id= req.params.id;
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Saldo.find({"cliente":id})
           .skip(desde) 
           .populate('cliente')
           .sort({fecha:-1})
           .limit(7)
           .exec( (err, saldos)=>{
            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar saldos de ese cliente',
                    errors: err
                });
            }
    
            if( !saldos ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El saldo del cliente con el id ' + id + ' no existe',
                    errors: {message: 'No existe saldos para ese cliente'}
                });
            }
            Saldo.count({},(err,conteo) =>{
                
                res.status(200).json({
                    ok: true,
                    saldos: saldos,
                    Total: conteo
                });
            });

         
        })
});
//============================================================
// OBTENER UN SALDO
//============================================================
app.get('/:id', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{

    var id= req.params.id;
    Saldo.findById( id )
        .populate('cliente')
        .exec( (err, saldo)=>{
            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar saldo',
                    errors: err
                });
            }
    
            if( !saldo ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El saldo con el id ' + id + ' no existe',
                    errors: {message: 'No existe un saldo con ese ID'}
                });
            }

            res.status(200).json({
                ok: true,
                saldo: saldo
            });
        })
});

//============================================================
// OBTENER UNA FACTURA POR FECHA
//============================================================
app.get('/saldo/:id/:desde/:hasta', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{
    
    var id= req.params.id;
    var desde= req.params.desde;
    var hasta= req.params.hasta;
    Saldo.find( {"cliente": id,
                   "fecha": 
                      {
                            $gte: desde,
                            $lte: hasta}
                      }
                 )

        .limit(7)
        .exec( (err, saldos)=>{
            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar saldos',
                    errors: err
                });
            }
    
            if( !saldos ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El saldo con el id ' + id + ' no existe',
                    errors: {message: 'No existe un saldo en esa fecha'}
                });
            }
            res.status(200).json({
                ok: true,
                saldos: saldos
            });
        })
});


//============================================================
// OBTENER  SALDO DE UN CLIENTE
//============================================================
app.get('/cliente/:id', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{
    var id= req.params.id;
    Saldo.find({"cliente":id})
        .populate('cliente')
        .exec( (err, saldos)=>{
            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar saldos',
                    errors: err
                });
            }
    
            if( !saldos ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El saldo con el id ' + id + ' no existe',
                    errors: {message: 'No existe saldos con ese ID'}
                });
            }
            saldos.forEach(element => {
                
            });

            res.status(200).json({
                ok: true,
                saldos: saldos
            });
        })
});


//============================================================
// CREAR UN NUEVO SALDO
//============================================================
app.post('/', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role] ,(req, res) => {

    var body = req.body;

    var saldo = new Saldo({
        fecha: body.fecha,
        importeTotal: body.importeTotal,
        pago: body.pago,
        cliente: body.cliente,
        disponible:false
    });
     crea(saldo)
        saldo.save( (err, saldoGuardado) =>{
            if(err){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear saldo',
                    errors: err
                });
            }
                 res.status(201).json({
                 ok: true,
                 saldo: saldoGuardado
                 });
            }) 
 
})

//============================================================
// ACTUALIZAR UN SALDO   
//============================================================

app.put('/:id', mdAutenticacion.verificarToken, (req,res) => {

    var id = req.params.id;
    var body = req.body;

    Saldo.findById(id, (err, saldo) => {

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar saldo',
                errors: err
            });
        }

        if( !saldo ){

            return res.status(400).json({
                ok: false,
                mensaje: 'El saldo con el id ' + id + ' no existe',
                errors: {message: 'No existe un saldo con ese ID'}
            });
        }

        saldo.fecha = body.fecha,
        saldo.importeTotal = body.importeTotal,
        saldo.pago = body.pago,
        saldo.cliente = body.cliente

        saldo.save( (err, saldoGuardado) => {

            if(err){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar saldo',
                    errors: err
                });
             }

             res.status(200).json({
                ok: true,
                saldo: saldoGuardado
            });

    } )

})
});

//============================================================
// ELIMINAR UN SALDO
//============================================================
app.delete('/:id',[ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) => {

    var id = req.params.id;

    Saldo.findByIdAndRemove(id, ( err, saldoBorrado ) =>{

        if(err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar saldo',
                errors: err
            });
         }

         if(!saldoBorrado){
            res.status(400).json({
                ok: false,
                mensaje: 'No existe saldo con ese id',
                errors: {message: 'No existe saldo con ese id'}
            });
         }

         res.status(200).json({
            ok: true,
            saldo: saldoBorrado
        });
    } )
});

var crea = function crearCta(saldo) {
  CC.findOne({ cliente: saldo.cliente }).exec((err, cta) => {
    if (err) {
      res.status(400).json({
        ok: false,
        mensaje: "Error al crear saldo",
        errors: err
      });
    }
    if (!cta) {
      var cuenta = new CC({
        total: saldo.importeTotal,
        cliente: saldo.cliente
      });
      cuenta.save((err, cuentaGuardada) => {});
    } else {
      (cta.total += saldo.importeTotal), cta.save((err, ok) => {});
    }
  });
};
module.exports = app; 