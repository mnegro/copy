var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Repuesto_Proveedor = require('../models/repuesto_proveedor');


//============================================================
// OBTENER TODOS LOS REP_PROV
//============================================================
app.get('/', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde); 

    Repuesto_Proveedor.find({})
    .skip(desde)
    .limit(5)
    .populate('repuesto','detalle')
    .populate('proveedor','empresa')
    .exec(
                (err, compras)=>{

                if(err){
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Compra',
                        errors: err
                    });
                }
            Repuesto_Proveedor.count({},(err,conteo) =>{
                
                res.status(200).json({
                    ok: true,
                    compras: compras,
                    Total: conteo
                });
            })

            })

}); 
//============================================================
// OBTENER UN REP_PROV
//============================================================
app.get('/:id', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{

    var id= req.params.id;
    Repuesto_Proveedor.find({ id })
    .populate('repuesto','detalle')
    .populate('proveedor','empresa')
        .exec( (err, compra)=>{
            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar Repuesto del proveedor',
                    errors: err
                });
            }
    
            if( !prov_rep ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La Compra con el id ' + id + ' no existe',
                    errors: {message: 'No existe una Compra con ese ID'}
                });
            }

            res.status(200).json({
                ok: true,
                compra: compra
            });
        })
});


//============================================================
// CREAR UNA NUEVA COMPRA
//============================================================
app.post('/', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role] ,(req, res) => {

    var body = req.body;

    var compra = new Repuesto_Proveedor({
        repuesto: body.repuesto,
        proveedor: body.proveedor,
        cantidad: body.cantidad,
        costoUnidad: body.costoUnidad,
        costoTotal: body.costoTotal,
        fecha: body.fecha
    });

    compra.save( (err, compraGuardada) =>{

        if(err){
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear compra',
                errors: err
            });
        }


    res.status(201).json({
        ok: true,
        compra: compraGuardada
      
    });
    })

});

//============================================================
// ACTUALIZAR UNA COMPRA   
//============================================================

app.put('/:id', mdAutenticacion.verificarToken, (req,res) => {

    var id = req.params.id;
    var body = req.body;

    Repuesto_Proveedor.findById(id, (err, compra) => {

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar compra',
                errors: err
            });
        }

        if( !compra ){

            return res.status(400).json({
                ok: false,
                mensaje: 'La compra con el id ' + id + ' no existe',
                errors: {message: 'No existe una compra con ese ID'}
            });
        }

        compra.repuesto = body.repuesto,
        compra.proveedor = body.proveedor,
        compra.cantidad = body.cantidad,
        compra.costoUnidad = body.costoUnidad,
        compra.costoTotal = body.costoTotal,
        compra.fechaCompra = body.fechaCompra

        compra.save( (err, compraGuardada) => {

            if(err){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar compra',
                    errors: err
                });
             }

             res.status(200).json({
                ok: true,
                compra: compraGuardada
            });

    } )

})
});

//============================================================
// ELIMINAR UNA COMPRA
//============================================================
app.delete('/:id',[ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) => {

    var id = req.params.id;

    Repuesto_Proveedor.findByIdAndRemove(id, ( err, compraBorrada ) =>{

        if(err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar compra',
                errors: err
            });
         }

         if(!compraBorrada){
            res.status(400).json({
                ok: false,
                mensaje: 'No existe compra con ese id',
                errors: {message: 'No existe compra con ese id'}
            });
         }

         res.status(200).json({
            ok: true,
            compra: compraBorrada
        });
    } )
});


module.exports = app; 