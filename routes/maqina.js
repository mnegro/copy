 var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Maqina = require('../models/maqina');


//============================================================
// OBTENER TODOS LAS MAQUINAS
//============================================================
app.get('/paginado/:desde', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req, res, next) => {

    var desde = req.params.desde || 0;
    desde = Number(desde); 

    Maqina.find({})
    .skip(desde)
    .limit(7)
    .populate('cliente')
    .exec(
                (err, maquinas)=>{

                if(err){
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Maquina',
                        errors: err
                    });
                }
            Maqina.count({},(err,conteo) =>{
                
                res.status(200).json({
                    ok: true,
                    maquinas: maquinas,
                    Total: conteo
                });
            })

            })

}); 

//============================================================
// OBTENER  UNA MAQUINA
//============================================================
app.get('/:id', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{

    var id= req.params.id;
    Maqina.findById( id )
        .populate('cliente')
        .exec( (err, maquina)=>{
            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar maquina',
                    errors: err
                });
            }
    
            if( !maquina ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La maquina con el id ' + id + ' no existe',
                    errors: {message: 'No existe una maquina con ese ID'}
                });
            }

            res.status(200).json({
                ok: true,
                maquina: maquina
            });
        })
});


//============================================================
// OBTENER UNA MAQUINA DE UN CLIENTE
//============================================================
app.get('/cliente/:id', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{
    var id= req.params.id;
    Maqina.find({"cliente":id})
    //Maquina.findById( clienteid )
        .populate('cliente')
        .exec( (err, maquina)=>{
            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar maquina',
                    errors: err
                });
            }
    
            if( !maquina ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La maquina con el id ' + id + ' no existe',
                    errors: {message: 'No existe una maquina con ese ID'}
                });
            }

            res.status(200).json({
                ok: true,
                maquina: maquina
            });
        })
});


//============================================================
// CREAR UNA NUEVA MAQUINA
//============================================================
app.post('/', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role] ,(req, res) => {

    var body = req.body;
    console.log(body);

    var maquina = new Maqina({
        marca: body.marca,
        modelo: body.modelo,
        serie: body.serie,
        alquilada: body.alquilada,
        contador: body.contador,
        precioCopia:body.precioCopia,
        descripcion: body.descripcion,
        accesorios: body.accesorios,
        cliente: body.cliente
    });

    maquina.save( (err, maquinaGuardada) =>{

        if(err){
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear maquina',
                errors: err
            });
        }


    res.status(201).json({
        ok: true,
        maquina: maquinaGuardada
      
    });
    })

});

//============================================================
// ACTUALIZAR UNA MAQUINA   
//============================================================

app.put('/:id', mdAutenticacion.verificarToken, (req,res) => {

    var id = req.params.id;
    var body = req.body;

    Maqina.findById(id, (err, maquina) => {

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar maquina',
                errors: err
            });
        }

        if( !maquina ){

            return res.status(400).json({
                ok: false,
                mensaje: 'La maquina con el id ' + id + ' no existe',
                errors: {message: 'No existe una maquina con ese ID'}
            });
        }

        maquina.marca = body.marca,
        maquina.modelo = body.modelo,
        maquina.serie = body.serie,
        maquina.alquilada = body.alquilada,
        maquina.contador = body.contador,
        maquina.precioCopia = body.precioCopia,
        maquina.descripcion = body.descripcion,
        maquina.accesorios = body.accesorios,
        maquina.cliente = body.cliente

        maquina.save( (err, maquinaGuardada) => {

            if(err){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar maquina',
                    errors: err
                });
             }

             res.status(200).json({
                ok: true,
                maquina: maquinaGuardada
            });

    } )

})
});

//============================================================
// ELIMINAR UNA MAQUINA
//============================================================
app.delete('/:id',[ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) => {

    var id = req.params.id;

    maquina.findByIdAndRemove(id, ( err, maquinaBorrada ) =>{

        if(err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar maquina',
                errors: err
            });
         }

         if(!maquinaBorrada){
            res.status(400).json({
                ok: false,
                mensaje: 'No existe maquina con ese id',
                errors: {message: 'No existe maquina con ese id'}
            });
         }

         res.status(200).json({
            ok: true,
            maquina: maquinaBorrado
        });
    } )
});


module.exports = app; 