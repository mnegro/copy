var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Cliente = require('../models/cliente');

//============================================================
// OBTENER TODOS LOS CLIENTES
//============================================================
app.get('/:paginado/:desde', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req, res, next) => {

    var desde = req.params.desde || 0;
    desde = Number(desde); 

    Cliente.find({})
    .skip(desde)
    .sort({nombre:1})
    .limit(7)
    // .populate('maquina')
    .exec(
                (err, clientes)=>{

                if(err){
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Cliente',
                        errors: err
                    });
                }
            Cliente.count({},(err,conteo) =>{
                
                res.status(200).json({
                    ok: true,
                    clientes: clientes,
                    Total: conteo
                });
            })

            })

}); 
//============================================================
// OBTENER UN CLIENTE   
//============================================================
app.get('/:id', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{

    var id= req.params.id;
    Cliente.findById( id )
        // .populate('maquina')
        .exec( (err, cliente)=>{
            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar cliente',
                    errors: err
                });
            }
    
            if( !cliente ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El cliente con el id ' + id + ' no existe',
                    errors: {message: 'No existe un cliente con ese ID'}
                });
            }

            res.status(200).json({
                ok: true,
                cliente: cliente
            });
        })
});
//============================================================
// ACTUALIZAR UN CLIENTE   
//============================================================

app.put('/:id', mdAutenticacion.verificarToken, (req,res) => {

    var id = req.params.id;
    var body = req.body;

    Cliente.findById(id, (err, cliente) => {

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar cliente',
                errors: err
            });
        }

        if( !cliente ){

            return res.status(400).json({
                ok: false,
                mensaje: 'El cliente con el id ' + id + ' no existe',
                errors: {message: 'No existe un cliente con ese ID'}
            });
        }

        cliente.razonSocial = body.razonSocial,
        cliente.nombre = body.nombre,
        cliente.apellido = body.apellido,
        cliente.cuit = body.cuit,
        cliente.localidad = body.localidad,
        cliente.direccion = body.direccion,
        cliente.email = body.email,
     

        cliente.save( (err, clienteGuardado) => {

            if(err){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar cliente',
                    errors: err
                });
             }

             res.status(200).json({
                ok: true,
                cliente: clienteGuardado
            });

    } )

})
});
//============================================================
// CREAR UN NUEVO CLIENTE   
//============================================================
app.post('/', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role] ,(req, res) => {

    var body = req.body;
    var cliente = new Cliente({
        razonSocial: body.razonSocial,
        nombre: body.nombre,
        apellido: body.apellido,
        cuit: body.cuit,
        localidad: body.localidad,
        direccion: body.direccion,
        email: body.email
       
    });

    cliente.save( (err, clienteGuardado) =>{

        if(err){
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear cliente',
                errors: err
            });
        }


    res.status(201).json({
        ok: true,
        cliente: clienteGuardado
      
    });
    })

});


//============================================================
// ELIMINAR UN CLIENTE  
//============================================================
app.delete('/:id',[ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) => {

    var id = req.params.id;

    Cliente.findByIdAndRemove(id, ( err, clienteBorrado ) =>{

        if(err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar cliente',
                errors: err
            });
         }

         if(!clienteBorrado){
            res.status(400).json({
                ok: false,
                mensaje: 'No existe cliente con ese id',
                errors: {message: 'No existe cliente con ese id'}
            });
         }

         res.status(200).json({
            ok: true,
            cliente: clienteBorrado
        });
    } )
});

module.exports = app; 

