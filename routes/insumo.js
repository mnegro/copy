var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Insumo = require('../models/insumo');

//============================================================
// OBTENER TODOS LOS INSUMOS
//============================================================
// [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role]
app.get('/:paginado/:desde', (req, res, next) => {

    var desde = req.params.desde || 0;
    desde = Number(desde); 
    console.log(desde)
    Insumo.find({ eliminado: false })
    .skip(desde)
    .limit(7)
    .exec(
                (err, insumos)=>{

                if(err){
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando insumos',
                        errors: err
                    });
                }
            Insumo.count({},(err,conteo) =>{
                res.status(200).json({
                    ok: true,
                    insumos: insumos,
                    Total: conteo
                });
            })

            })

}); 
//============================================================
// OBTENER UN INSUMO   
//============================================================
app.get('/:id', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{

    var id= req.params.id;
    Insumo.findById( id )
        .populate('proveedor')
        .exec( (err, insumo)=>{
            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar insumo',
                    errors: err
                });
            }
    
            if( !insumo ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El insumo con el id ' + id + ' no existe',
                    errors: {message: 'No existe un insumo con ese ID'}
                });
            }

            res.status(200).json({
                ok: true,
                insumo: insumo
            });
        })
});
//============================================================
// OBTENER  INSUMOS PROVEEDOR
//============================================================
app.get('/ins_prov/:busqueda/:prov', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var proveedor = req.params.prov;
    var regex = new RegExp(busqueda, 'i');
    Insumo.find({proveedor: proveedor})
               .or([{ 'tipo': regex }, { 'codigo': regex }])
                .exec((err, insumos) => {

                        if(err){
                            res.status(500).json({
                                ok: false,
                                mensaje: 'Error cargando Insumo',
                                errors: err
                            });
                                
                    }  return res.status(200).json({
                        ok: true,
                        insumos:insumos
                        
             });
       });
}); 
//============================================================
// ACTUALIZAR UN INSUMO   
//============================================================

app.put('/:id', mdAutenticacion.verificarToken, (req,res) => {

    var id = req.params.id;
    var body = req.body;
    Insumo.findById(id, (err, insumo) => {

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar insumo',
                errors: err
            });
        }

        if( !insumo ){

            return res.status(400).json({
                ok: false,
                mensaje: 'El insumo con el id ' + id + ' no existe',
                errors: {message: 'No existe un insumo con ese ID'}
            });
        }

        insumo.codigo = body.codigo,
        insumo.tipo = body.tipo,
        insumo.marca = body.marca,
        insumo.detalle = body.detalle,
        insumo.costo = body.costo,
        stockMinimo = body.stockMinimo,
        insumo.porcAplicado = body.porcAplicado,
        insumo.precio = body.precio,
        insumo.stock = body.stock,
        insumo.eliminado = body.eliminado,
        insumo.proveedor = body.proveedor

        if( insumo.precio == 0 ){
            insumo.precio = insumo.costo + ((insumo.costo * insumo.porcAplicado)/100);
        }
        insumo.save( (err, insumoGuardado) => {

            if(err){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar insumo',
                    errors: err
                });
             }

             res.status(200).json({
                ok: true,
                insumo: insumoGuardado
            });

    } )

})
});
//============================================================
// CREAR UN NUEVO INSUMO   
//============================================================
app.post('/', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role] ,(req, res) => {

    var body = req.body;
    var insumo = new Insumo({
        codigo: body.codigo,
        tipo: body.tipo,
        marca: body.marca,
        detalle: body.detalle,
        costo: body.costo,
        stockMinimo: body.stockMinimo,
        porcAplicado: body.porcAplicado,
        precio: body.precio,
        stock: body.stock,
        proveedor: body.proveedor,
    });
     Insumo.findOne({codigo:insumo.codigo},(err,insumoExistente) =>{
        if(insumoExistente){
              res.status(400).json({
                ok: false,
                mensaje: 'Ya existe un insumo con ese codigo',
                errors: err
            });
        }else{
                if( insumo.precio == 0 ){
                    insumo.precio = insumo.costo + ((insumo.costo * insumo.porcAplicado)/100);
                }
    insumo.save( (err, insumoGuardado) =>{

        if(err){
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear insumo',
                errors: err
            });
        }
    res.status(201).json({
        ok: true,
        insumo: insumoGuardado
      
    });
});
}});
});

//============================================================
// ELIMINAR UN REPUESTO  
//============================================================
app.delete('/:id',[ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) => {

    var id = req.params.id;

    Insumo.findById(id, ( err, insumoBorrado ) =>{

        if(err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar insumo',
                errors: err
            });
         }

         if(!insumoBorrado){
            res.status(400).json({
                ok: false,
                mensaje: 'No existe insumo con ese id',
                errors: {message: 'No existe insumo con ese id'}
            });
         }
         insumoBorrado.eliminado = true;
         insumoBorrado.save( (err, eliminado) =>{

            if(err){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear insumo',
                    errors: err
                });
            }
    
         res.status(200).json({
            ok: true,
            insumo: eliminado
        });
    } )
});
});

module.exports = app; 
