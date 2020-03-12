var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Proveedor = require('../models/proveedor');

//============================================================
// OBTENER TODOS LOS PROVEEDORES
//============================================================
app.get('/', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde); 

    Proveedor.find({})
    .skip(desde)
    .limit(5)
    .exec(
                (err, proveedores)=>{

                if(err){
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Proveedor',
                        errors: err
                    });
                }
            Proveedor.count({},(err,conteo) =>{
                
                res.status(200).json({
                    ok: true,
                    proveedores: proveedores,
                    Total: conteo
                });
            })

            })

}); 
//============================================================
// OBTENER UN PROVEEDOR   
//============================================================
app.get('/:id', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{

    var id= req.params.id;
    Proveedor.findById( id )
        .exec( (err, proveedor)=>{
            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar proveedor',
                    errors: err
                });
            }
    
            if( !proveedor ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El proveedor con el id ' + id + ' no existe',
                    errors: {message: 'No existe un cliente con ese ID'}
                });
            }

            res.status(200).json({
                ok: true,
                proveedor: proveedor
            });
        })
});
//============================================================
// ACTUALIZAR UN PROVEEDOR   
//============================================================

app.put('/:id', mdAutenticacion.verificarToken, (req,res) => {

    var id = req.params.id;
    var body = req.body;

    Proveedor.findById(id, (err, proveedor) => {

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar proveedor',
                errors: err
            });
        }

        if( !proveedor ){

            return res.status(400).json({
                ok: false,
                mensaje: 'El proveedor con el id ' + id + ' no existe',
                errors: {message: 'No existe un proveedor con ese ID'}
            });
        }

        proveedor.empresa = body.empresa,
        proveedor.cuit = body.cuit,
        proveedor.localidad = body.localidad,
        proveedor.direccion = body.direccion,
        proveedor.email = body.email,
     

        proveedor.save( (err, proveedorGuardado) => {

            if(err){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar proveedor',
                    errors: err
                });
             }

             res.status(200).json({
                ok: true,
                proveedor: proveedorGuardado
            });

    } )

})
});
//============================================================
// CREAR UN NUEVO PROVEEDOR   
//============================================================
app.post('/', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role] ,(req, res) => {

    var body = req.body;
    var proveedor = new Proveedor({
        empresa: body.empresa,
        cuit: body.cuit, 
        localidad: body.localidad,
        direccion: body.direccion,
        email: body.email
       
    });

    proveedor.save( (err, proveedorGuardado) =>{

        if(err){
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear proveedor',
                errors: err
            });
        }


    res.status(201).json({
        ok: true,
        proveedor: proveedorGuardado
      
    });
    })

});


//============================================================
// ELIMINAR UN PROVEEDOR      
//============================================================
app.delete('/:id',[ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) => {

    var id = req.params.id;

    Proveedor.findByIdAndRemove(id, ( err, proveedorBorrado ) =>{

        if(err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar proveedor',
                errors: err
            });
         }

         if(!proveedorBorrado){
            res.status(400).json({
                ok: false,
                mensaje: 'No existe proveedor con ese id',
                errors: {message: 'No existe proveedor con ese id'}
            });
         }

         res.status(200).json({
            ok: true,
            proveedor: proveedorBorrado
        });
    } )
});

module.exports = app; 

