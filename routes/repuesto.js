var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Repuesto = require('../models/repuesto');

//============================================================
// OBTENER TODOS LOS REPUESTOS
//============================================================
// [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role]
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde); 

    Repuesto.find({ eliminado: false })
    .skip(desde)
    .limit(7)
    .exec(
                (err, repuestos)=>{

                if(err){
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Repuesto',
                        errors: err
                    });
                }
            Repuesto.count({},(err,conteo) =>{
                res.status(200).json({
                    ok: true,
                    repuestos: repuestos,
                    Total: conteo
                });
            })

            })

}); 
//============================================================
// OBTENER  REPUESTOS PROVEEDOR
//============================================================
app.get('/rep_prov/:busqueda/:prov', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var proveedor = req.params.prov;
    var regex = new RegExp(busqueda, 'i');
    Repuesto.find({proveedor: proveedor})
               .or([{ 'tipo': regex }, { 'codigo': regex }])
                .exec((err, repuestos) => {

                        if(err){
                            res.status(500).json({
                                ok: false,
                                mensaje: 'Error cargando Repuesto',
                                errors: err
                            });
                                
                    }  return res.status(200).json({
                        ok: true,
                        repuestos: repuestos
                        
             });
       });
}); 
//============================================================
// OBTENER UN REPUESTO   
//============================================================
app.get('/:id', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{

    var id= req.params.id;
    Repuesto.findById( id )
        // .populate('maquina')
        .exec( (err, repuesto)=>{
            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar repuesto',
                    errors: err
                });
            }
    
            if( !repuesto ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El repuesto con el id ' + id + ' no existe',
                    errors: {message: 'No existe un repuesto con ese ID'}
                });
            }

            res.status(200).json({
                ok: true,
                repuesto: repuesto
            });
        })
});
//============================================================
// OBTENER UN REPUESTO POR CODIGO  
//============================================================
app.get('/:codigo', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{

    var codigo= req.params.id;
    Repuesto.find({codigo: codigo})
        .exec( (err, repuesto)=>{
            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar repuesto',
                    errors: err
                });
            }
    
            if( !repuesto ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El repuesto con el codigo ' + id + ' no existe',
                    errors: {message: 'No existe un repuesto con ese codigo'}
                });
            }

            res.status(200).json({
                ok: true,
                repuesto: repuesto
            });
        })
});
//============================================================
// ACTUALIZAR UN REPUESTO   
//============================================================

app.put('/:id', mdAutenticacion.verificarToken, (req,res) => {

    var id = req.params.id;
    var body = req.body;
    console.log(body);
    Repuesto.findById(id, (err, repuesto) => {

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar repuesto',
                errors: err
            });
        }

        if( !repuesto ){

            return res.status(400).json({
                ok: false,
                mensaje: 'El repuesto con el id ' + id + ' no existe',
                errors: {message: 'No existe un repuesto con ese ID'}
            });
        }

        repuesto.codigo = body.codigo,
        repuesto.tipo = body.tipo,
        repuesto.marca = body.marca,
        repuesto.condicion = body.condicion,
        repuesto.detalle = body.detalle,
        repuesto.costo = body.costo,
        repuesto.porcAplicado = body.porcAplicado,
        repuesto.precio = body.precio,
        repuesto.stock = body.stock,
        repuesto.stockMinimo = body.stockMinimo,
        repuesto.duracion = body.duracion,
        repuesto.eliminado = body.eliminado,
        repuesto.proveedor = body.proveedor
        console.log(repuesto);
        repuesto.save( (err, repuestoGuardado) => {

            if(err){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar repuesto',
                    errors: err
                });
             }

             res.status(200).json({
                ok: true,
                repuesto: repuestoGuardado
            });

    } )

})
});
//============================================================
// CREAR UN NUEVO REPUESTO   
//============================================================
app.post('/', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role] ,(req, res) => {

    var body = req.body;
    var repuesto = new Repuesto({
        codigo: body.codigo,
        tipo: body.tipo,
        marca: body.marca,
        condicion: body.condicion,
        detalle: body.detalle,
        costo: body.costo,
        porcAplicado: body.porcAplicado,
        precio: body.precio,
        stock: body.stock,
        duracion: body.duracion,
        stockMinimo: body.stockMinimo,
        proveedor: body.proveedor
    });
    //Verifico que no exista por codigo
    Repuesto.findOne({codigo:repuesto.codigo},(err,repuestoExistente) =>{
        if(repuestoExistente){
              res.status(400).json({
                ok: false,
                mensaje: 'Ya existe un repuesto con ese codigo',
                errors: err
            });
        }else{
        if( repuesto.precio == 0 ){
            repuesto.precio = repuesto.costo + ((repuesto.costo * repuesto.porcAplicado)/100);
    
        }
        repuesto.save( (err, repuestoGuardado) =>{
    
            if(err){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear repuesto',
                    errors: err
                });
            }
        res.status(201).json({
            ok: true,
            repuesto: repuestoGuardado
          
        });
    });
    
}})
})


//============================================================
// DEVUELVE STOCK
//============================================================

app.put('/devuelve/repuesto',  (req,res) => {
    var id = req.body._id;
    var body = req.body;
    Repuesto.findById(id, (err, repuesto) => {
        

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar repuesto',
                errors: err
            });
        }

        if( !repuesto ){

            return res.status(400).json({
                ok: false,
                mensaje: 'El repuesto con el id ' + id + ' no existe',
                errors: {message: 'No existe un repuesto con ese ID'}
            });
        }

        repuesto.stock += body.cantidad

        repuesto.save( (err, repuestoGuardado) => {

            if(err){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar repuesto',
                    errors: err
                });
             }

             res.status(200).json({
                ok: true,
                repuesto: repuestoGuardado
            });

    } )

})
});

//============================================================
// ELIMINAR UN REPUESTO  
//============================================================
app.delete('/:id',[ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) => {

    var id = req.params.id;

    Repuesto.findById(id, ( err, repuestoBorrado ) =>{

        if(err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar repuesto',
                errors: err
            });
         }

         if(!repuestoBorrado){
            res.status(400).json({
                ok: false,
                mensaje: 'No existe repuesto con ese id',
                errors: {message: 'No existe cliente con ese id'}
            });
         }
         repuestoBorrado.eliminado = true;
         repuestoBorrado.save( (err, eliminado) =>{

            if(err){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear repuesto',
                    errors: err
                });
            }
    
         res.status(200).json({
            ok: true,
            repuesto: eliminado
        });
    } )
});
});
//Buscar por codigo

function existe(codigo){
    var salida;
    console.log(codigo);
    Repuesto.findOne({codigo:codigo},(err,repuesto) =>{
            console.log(repuesto)
         if(repuesto==null){
           salida = false;
         }
         else{
             salida = true;
         }
})
console.log(salida);
return salida
}
module.exports = app; 
