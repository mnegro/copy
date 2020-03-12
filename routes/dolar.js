var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Dolar = require('../models/dolar');

//============================================================
// OBTENER TODOS LOS DOLARES
//============================================================
app.get('/', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req, res, next) => {

    Dolar.find({})
       .exec(
                (err, dolares)=>{

                if(err){
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Dolar',
                        errors: err
                    });
                }
            Dolar.count({},(err,conteo) =>{
                
                res.status(200).json({
                    ok: true,
                    dolares: dolares,
                    Total: conteo
                });
            })

            })

}); 
//============================================================
// OBTENER EL DOLAR   
//============================================================
app.get('/hoy', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{

    var id= req.params.id;
    Dolar.findOne()
        .exec( (err, dolar)=>{
            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar dolar',
                    errors: err
                });
            }
    
            if( !dolar ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El dolar con el id ' + id + ' no existe',
                    errors: {message: 'No existe dolar'}
                });
            }

            res.status(200).json({
                ok: true,
                dolar: dolar
            });
        })
});
//============================================================
// ACTUALIZAR DOLAR   
//============================================================

app.put('/:id', mdAutenticacion.verificarToken, (req,res) => {

    var id = req.params.id;
    var body = req.body;

    Dolar.findById(id, (err, dolar) => {

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar dolar',
                errors: err
            });
        }

        if( !dolar ){

            return res.status(400).json({
                ok: false,
                mensaje: 'El dolar con el id ' + id + ' no existe',
                errors: {message: 'No existe dolar'}
            });
        }

        dolar.valor = body.valor
           

        dolar.save( (err, dolarGuardado) => {

            if(err){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar dolar',
                    errors: err
                });
             }

             res.status(200).json({
                ok: true,
                dolar: dolarGuardado
            });

    } )

})
});
//============================================================
// CREAR DOLAR
//============================================================
app.post('/', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role] ,(req, res) => {

    var body = req.body;
    var dolar = new Dolar({
        valor: body.valor      
    });

    dolar.save( (err, dolarGuardado) =>{

        if(err){
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear dolar',
                errors: err
            });
        }


    res.status(201).json({
        ok: true,
        dolar: dolarGuardado
      
    });
    })

});


module.exports = app; 