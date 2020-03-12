var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var CC = require('../models/ctas');
//============================================================
// OBTENER  CUENTA DE UN CLIENTE
//============================================================
app.get('/cliente/:id', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{
    var id= req.params.id;
    CC.findOne({ cliente: id }).exec((err, cuenta) => {
            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar cuenta',
                    errors: err
                });
            }
    
            if( !cuenta ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La cuenta no existe',
                    errors: {message: 'No existe cuenta de cliente con ese ID'}
                });
            }

            res.status(200).json({
                ok: true,
                cuenta: cuenta
            });
        })
});


//============================================================
// CREAR NUEVA CUENTA
//============================================================
app.post('/', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role] ,(req, res) => {
    var body = req.body;

    var cuenta = new CC({
        total: body.total,
        cliente: body.cliente,
        
    })
  
    cuenta.save( (err, cuentaGuardada) =>{

        if(err){
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear cuenta',
                errors: err
            });
        }


    res.status(201).json({
        ok: true,
        cuenta: cuentaGuardada
      
    });
    })

});

//============================================================
// ACTUALIZAR UNA CUENTA   
//============================================================

app.put('/:id', mdAutenticacion.verificarToken, (req,res) => {
    var id = req.params.id;
    var body = req.body;

  console.log(id)
  console.log(body)
    CC.findById(id, (err, cuenta) => {

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar cuenta',
                errors: err
            });
        }

        if( !cuenta ){

            return res.status(400).json({
                ok: false,
                mensaje: 'La cuenta con el id ' + id + ' no existe',
                errors: {message: 'No existe una cuenta con ese ID'}
            });
        }

        cuenta.total = body.total,
        cuenta.cliente = body.cliente

        cuenta.save( (err, cuentaGuardada) => {

            if(err){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar cuenta',
                    errors: err
                });
             }

             res.status(200).json({
                ok: true,
                cuenta: cuentaGuardada
            });

    } )

})
});

module.exports =function crearCta( total,clienteId ){
    let promesa = new Promise ((resolve,reject) =>{
        var cuenta = new CC({
            total: total,
            cliente: clienteId,
            
        })

        cuenta.save( (err, cuentaGuardada) =>{
    
            if(err){
               reject(err)
            }
    
    
          resolve(cuentaGuardada)
        })
    });
    return promesa;
}

module.exports = app; 