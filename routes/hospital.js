var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

//============================================================
// OBTENER TODOS LOS HOSPITALES
//============================================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde); 

    Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .exec(
                (err, hospitales)=>{

                if(err){
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Hospital',
                        errors: err
                    });
                }

            Hospital.count({},(err,conteo) =>{
                
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    Total: conteo
                });

            })
            })

}); 


//============================================================
// ACTUALIZAR UN HOSPITAL   
//============================================================

app.put('/:id', mdAutenticacion.verificarToken, (req,res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if(err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if( !hospital ){

            res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: {message: 'No existe un hospital con ese ID'}
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save( (err, hospitalGuardado) => {

            if(err){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
             }

             res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

    } )

})
});


//============================================================
// CREAR UN NUEVO HOSPITAL   
//============================================================
app.post('/', mdAutenticacion.verificarToken ,(req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save( (err, hospitalGuardado) =>{

        if(err){
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }


    res.status(201).json({
        ok: true,
        hospital: hospitalGuardado
      
    });
    })

});


//============================================================
// ELIMINAR UN HOSPITAL  
//============================================================
app.delete('/:id',mdAutenticacion.verificarToken, (req,res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, ( err, hospitalBorrado ) =>{

        if(err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar hoapital',
                errors: err
            });
         }

         if(!hospitalBorrado){
            res.status(400).json({
                ok: false,
                mensaje: 'No existe hospital con ese id',
                errors: {message: 'No existe hospital con ese id'}
            });
         }

         res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    } )
});

// ==========================================
//  Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
            }); }

            if (!hospital) {
                return res.status(400).json({
                     ok: false,
                     mensaje: 'El hospital con el id ' + id + 'no existe',
                     errors: { message: 'No existe un hospital con ese ID'}
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
    })
})

module.exports = app; 