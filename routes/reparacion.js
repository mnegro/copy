var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Reparacion = require('../models/reparacion');

var Repuesto = require('../models/repuesto');

//============================================================
// OBTENER TODOS LAS REPARACIONES
//============================================================
app.get('/', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde); 

    Reparacion.find({})
    .skip(desde)
    .limit(5)
    // .populate('cliente')
    .exec(
                (err, reparaciones)=>{

                if(err){
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Reparacion',
                        errors: err
                    });
                }
            Reparacion.count({},(err,conteo) =>{
                
                res.status(200).json({
                    ok: true,
                    reparaciones: reparaciones,
                    Total: conteo
                });
            })

            })

}); 

//============================================================
// OBTENER  REPARACION
//============================================================
app.get('/:id', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{

    var id= req.params.id;
    Reparacion.findById( id )
        // .populate('maquina')
        .exec( (err, reparacion)=>{

            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar reparacion',
                    errors: err
                });
            }
    
            if( !reparacion ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La reparacion con el id ' + id + ' no existe',
                    errors: {message: 'No existe reparacion'}
                });
            }

            res.status(200).json({
                ok: true,
                reparacion: reparacion
            });
        })
});

//============================================================
// OBTENER  REPARACIONES DE UNA MAQUINA
//============================================================
app.get('/maquina/:id', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{

    var id= req.params.id;
    Reparacion.find({"maquina":id})
        // .populate('maquina')
        .exec( (err, reparaciones)=>{
            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar reparaciones',
                    errors: err
                });
            }
    
            if( !reparaciones ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La maquina con el id ' + id + ' no existe',
                    errors: {message: 'No existe reparaciones para esa maquina'}
                });
            }
            // nuevoArray= reparaciones;
            // for (let i = 0; i < nuevoArray.length; i++) {
            //     suma =0;
            //     if( nuevoArray.length>0 ){

            //         for( s=0; s < nuevoArray[i].repuestos.length; s++ ){
            
            //             var cantidad = nuevoArray[i].repuestos[s].cantidad;
            //             var id = nuevoArray[i].repuestos[s]._id;
            //             nuevoArray[i].repuestos[s].precio = precioActualizado(id);
            //             nuevoArray[i].total += calcularMonto(id,cantidad,nuevoArray[i]._id);
            //              nuevoArray[i].total += nuevoArray[i].repuestos[s].precio * cantidad;
            //             console.log(nuevoArray[i].repuestos[s].precio );
            //         }
                   
            //       }
            //       //nuevoArray[i].total = suma;
            // }
            for (const reparacion of reparaciones) {
                // for (const repuesto in reparacion.repuestos) {
                //         precioActualizado(reparacion.repuestos[repuesto]._id).then(respuesta => {
                //             reparacion.repuestos[repuesto].precio=respuesta;
                //         });
                //         reparacion.total += reparacion.repuestos[repuesto].cantidad * reparacion.repuestos[repuesto].precio;
                    
                // }
                // for (let i = 0; i < reparacion.repuestos.length; i++) {
                //     precioActualizado(reparacion.repuestos[i]._id).then(respuesta => {
                //         reparacion.repuestos[i].precio=respuesta;
                //         console.log(reparacion.repuestos[i].precio);

                //     });
                //     reparacion.total += reparacion.repuestos[i].cantidad *  reparacion.repuestos[i].precio;
                // }
                
                for (const repuesto of reparacion.repuestos) {
                       
                       repuesto.precio = precioActualizado(repuesto._id).then();
                       reparacion.total += repuesto.cantidad * repuesto.precio;
                        console.log(repuesto.precio);
                }
            }

            res.status(200).json({
                ok: true,
                reparaciones: reparaciones
            });
        })
});


//============================================================
// OBTENER  CAMBIO DE UN REPUESTO
//============================================================

app.get('/reparacion/:idmaquina/:repuesto', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{
   
    var id= req.params.idmaquina;
    var busqueda = req.params.repuesto;
    var regex = new RegExp(busqueda, 'i');

    var repuesto= req.params.repuesto;
 
           Reparacion.find( { "maquina":id,"repuestos": {$elemMatch:{tipo:regex}}} )
           .sort({fecha:1})
           .exec( (err,resp)=>{
            res.status(200).json({
                ok: true,
                reparacion: resp
            });  
        })
 });
       
// });

//============================================================
// CREAR UNA NUEVA REPARACION
//============================================================
app.post('/', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role] ,(req, res) => {

    var body = req.body;
    console.log(body)

    var reparacion = new Reparacion({
        fecha: body.fecha,
        contador: body.contador,
        descripcion: body.descripcion,
        limpModulo: body.limpModulo,
        limpOptica: body.limpOptica,
        facturada: false,
        total: body.total,
        maquina: body.maquina,
        modulo: body.modulo,
        repuestos: body.repuestos
       
    });
    console.log(reparacion)
    if( reparacion.repuestos.length){
        for( i=0; i < reparacion.repuestos.length; i++ ){

            var cantidad = reparacion.repuestos[i].cantidad;
            var id = reparacion.repuestos[i]._id;
            verificaStock(id,cantidad);
        }
       
      }

    reparacion.save( (err, reparacionGuardada) =>{

        if(err){
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear reparacion',
                errors: err
            });
        }


    res.status(201).json({
        ok: true,
        reparacion: reparacionGuardada
      
    });
});
    

});

//============================================================
// ACTUALIZAR UNA REPARACION   
//============================================================

app.put('/:id', mdAutenticacion.verificarToken, (req,res) => {

    var id = req.params.id;
    var body = req.body;

    Reparacion.findById(id, (err, reparacion) => {

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar reparacion',
                errors: err
            });
        }

        if( !reparacion ){

            return res.status(400).json({
                ok: false,
                mensaje: 'La reparacion con el id ' + id + ' no existe',
                errors: {message: 'No existe una reparacion con ese ID'}
            });
        }

        reparacion.fecha = body.fecha,
        reparacion.contador = body.contador,
        reparacion.descripcion = body.descripcion,
        reparacion.limpModulo = body.limpModulo,
        reparacion.limpOptica = body.limpOptica,
        reparacion.facturada = body.facturada,
        reparacion.total = body.total,
        reparacion.maquina = body.maquina,
        reparacion.modulo = body.modulo,

        nuevoArray = body.repuestos;
        
        for( i=0; i<nuevoArray.length; i++ ){
            if( nuevoArray[i].cantidadEditar > 0 ){
                if( nuevoArray[i].cantidad > nuevoArray[i].cantidadEditar ){
                    var devuelve = nuevoArray[i].cantidad - nuevoArray[i].cantidadEditar;
                    nuevoArray[i].cantidad = nuevoArray[i].cantidadEditar;
                    devuelveStock( nuevoArray[i]._id, devuelve );
                    nuevoArray[i].cantidadEditar = 0;
                } else if( nuevoArray[i].cantidad < nuevoArray[i].cantidadEditar ){
                    var quita = nuevoArray[i].cantidadEditar - nuevoArray[i].cantidad;
                    nuevoArray[i].cantidad = nuevoArray[i].cantidadEditar;
                    quitaStock( nuevoArray[i]._id, quita );
                    nuevoArray[i].cantidadEditar = 0;
                }
          } 
        }
        
          
        reparacion.repuestos = nuevoArray;
        
        reparacion.save( (err, reparacionGuardada) => {

            if(err){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar reparacion',
                    errors: err
                });
             }

             res.status(200).json({
                ok: true,
                reparacion: reparacionGuardada
            });

    } )

})
});

//============================================================
// ELIMINAR UNA REPARACION
//============================================================
app.delete('/:id',[ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) => {

    var id = req.params.id;
    Reparacion.findByIdAndRemove(id, ( err, reparacionBorrada ) =>{
    
        if(err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar reparacion',
                errors: err
            });
         }

         if(!reparacionBorrada){
            res.status(400).json({
                ok: false,
                mensaje: 'No existe reparacion con ese id',
                errors: {message: 'No existe reparacion con ese id'}
            });
         }

         res.status(200).json({
            ok: true,
            reparacion: reparacionBorrada
        });
    } )
});


function verificaStock(id,cantidad){
   
    return new Promise((resolve, reject) =>{

        Repuesto.findById(id,(err, repuesto)=>{
          
            if(err){
                reject('Error al buscar repuesto', err);
            };
            if(repuesto.stock < cantidad){
                 reject('No hay suficiente stock', err);
            }else{

                repuesto.stock = repuesto.stock - cantidad;
        
                repuesto.save( (err, repuestoGuardado) => {
                    if(err){
                        reject('Error al actualizar repuesto', err)
            
                         }else{
                             resolve(repuestoGuardado);
                         }
                        
                        });
             }
            
        
         
            })
        
        });
        
 };


function devuelveStock(id,cantidad){
    return new Promise((resolve, reject) =>{

        Repuesto.findById(id,(err, repuesto)=>{
          
            if(err){
                reject('Error al buscar repuesto', err);
            }else{

                repuesto.stock = repuesto.stock + cantidad;
        
                repuesto.save( (err, repuestoGuardado) => {
                    if(err){
                        reject('Error al actualizar repuesto', err)
            
                         }else{
                             resolve(repuestoGuardado);
                         }
                        
                        });
             }
            
        
         
            })
        
        });
        
 };



 function quitaStock(id,cantidad){
   
    return new Promise((resolve, reject) =>{
        Repuesto.findById(id,(err, repuesto)=>{
          
            if(err){
                reject('Error al buscar repuesto', err);
            }else{

                repuesto.stock = repuesto.stock - cantidad;
        
                repuesto.save( (err, repuestoGuardado) => {
                    if(err){
                        reject('Error al actualizar repuesto', err)
            
                         }else{
                             resolve(repuestoGuardado);
                         }
                        
                        });
             }
            
        
         
            })
        
        });
        
 };

 function calcularMonto(id,cantidad,idrep){
   var total=0;
   var precioAct=0;
    return new Promise((resolve, reject) =>{
        Repuesto.findById(id,(err, repuesto)=>{
          
            if(err){
                reject('Error al buscar repuesto', err);
            }else{
                precioAct = repuesto.precio;
                total = repuesto.precio * cantidad;

                Reparacion.findById(idrep,(err,reparacion)=>{
                    reparacion.repuestos.findById(id ,(err,resp)=>{
                        resp.precio= precioAct;
                        console.log(resp.precio);
                    })                 
                    reparacion.total = total;
                
                reparacion.save( (err, actualizado) => {
                    if(err){
                        reject('Error al actualizar reparacion', err)
            
                         }else{
                             resolve(actualizado);
                         }
                        
                        });
                })
               
                resolve(total);
             }
            
            })
        
        });
        
 };

 function precioActualizado(id){
   var precio=0;
    return new Promise((resolve, reject) =>{
        Repuesto.findById(id,(err, repuesto)=>{
          
            if(err){
                reject('Error al buscar repuesto', err);
            }else{
               
                precio = repuesto.precio;
                 resolve(precio);
             }
            
            })
       
        });
        
 };


module.exports = app; 