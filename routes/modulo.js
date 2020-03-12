var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Modulo = require('../models/modulo');

var Reparacion = require('../models/reparacion');

var Repuesto = require('../models/repuesto');


//============================================================
// OBTENER TODOS LOS MODULOS
//============================================================
app.get('/', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde); 

    Modulo.find({})
    .skip(desde)
    .limit(5)
    // .populate('cliente')
    .exec(
                (err, modulos)=>{

                if(err){
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando modulos',
                        errors: err
                    });
                }
            Modulo.count({},(err,conteo) =>{
                
                res.status(200).json({
                    ok: true,
                    modulos: modulos,
                    Total: conteo
                });
            })

            })

}); 

//============================================================
// OBTENER  MODULO
//============================================================
app.get('/:id', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{

    var id= req.params.id;
    Modulo.findById( id )
     .populate('maquina')
        .exec( (err, modulo)=>{

            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar modulo',
                    errors: err
                });
            }
    
            if( !modulo ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El modulo con el id ' + id + ' no existe',
                    errors: {message: 'No existe modulo'}
                });
            }

            res.status(200).json({
                ok: true,
                modulo: modulo
            });
        })
});

//============================================================
// OBTENER  MODULOS DE UNA MAQUINA
//============================================================
app.get('/maquina/:id', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{

    var id= req.params.id;
    Modulo.find({"maquina":id})
        // .populate('maquina')
        .exec( (err, modulos)=>{
            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar modulos',
                    errors: err
                });
            }
    
            if( !modulos ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La maquina con el id ' + id + ' no existe',
                    errors: {message: 'No existe modulos para esa maquina'}
                });
            }
          
            res.status(200).json({
                ok: true,
                modulos: modulos
            });
        })
});


//============================================================
// OBTENER  CAMBIO DE UN REPUESTO
//============================================================

app.get('/modulo/:idmodulo/:repuesto', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{
   
    var id= req.params.idmodulo;
    var busqueda = req.params.repuesto;
    var regex = new RegExp(busqueda, 'i');

           Modulo.find( { "_id":id,"repuestos": {$elemMatch:{tipo:regex}}} )
           .sort({fecha:1})
           .exec( (err,resp)=>{
            res.status(200).json({
                ok: true,
                modulo: resp
            });  
        })
 });
       
// });

//============================================================
// CREAR UN MODULO
//============================================================
app.post('/', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role] ,(req, res) => {

    var body = req.body;
    console.log(body)

    var modulo = new Modulo({
        codigo: body.codigo,
        contador: body.contador,
        descripcion: body.descripcion,
        limpModulo: body.limpModulo,
        ingreso: body.ingreso,
        egreso: body.egreso,
        maquina: body.maquina,
        repuestos: body.repuestos
       
    });
    console.log(modulo)
    if( modulo.repuestos.length){
        console.log('estoy verificando');

        for( i=0; i < modulo.repuestos.length; i++ ){

            var cantidad = modulo.repuestos[i].cantidad;
            var id = modulo.repuestos[i]._id;
            verificaStock(id,cantidad);
        }
       
      }

    modulo.save( (err, moduloGuardado) =>{

        if(err){
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear modulo',
                errors: err
            });
        }


    res.status(201).json({
        ok: true,
        modulo: moduloGuardado
      
    });
});
    

});

//============================================================
// ACTUALIZAR UN MODULO   
//============================================================

app.put('/:id', mdAutenticacion.verificarToken, (req,res) => {

    var id = req.params.id;
    var body = req.body;

    Modulo.findById(id, (err, modulo) => {

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar modulo',
                errors: err
            });
        }

        if( !modulo ){

            return res.status(400).json({
                ok: false,
                mensaje: 'El modulo con el id ' + id + ' no existe',
                errors: {message: 'No existe un modulo con ese ID'}
            });
        }

        modulo.codigo = body.codigo,
        modulo.contador = body.contador,
        modulo.descripcion = body.descripcion,
        modulo.limpModulo = body.limpModulo,
        modulo.ingreso = body.ingreso,
        modulo.egreso = body.egreso,
        modulo.maquina = body.maquina,

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
        
          
        modulo.repuestos = nuevoArray;
        
        modulo.save( (err, moduloGuardado) => {

            if(err){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar modulo',
                    errors: err
                });
             }

             res.status(200).json({
                ok: true,
                modulo: moduloGuardado
            });

    } )

})
});

//============================================================
// ELIMINAR UN MODULO
//============================================================
app.delete('/:id',[ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) => {

    var id = req.params.id;
    Modulo.findByIdAndRemove(id, ( err, moduloBorrado ) =>{
    
        if(err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar modulo',
                errors: err
            });
         }

         if(!moduloBorrado){
            res.status(400).json({
                ok: false,
                mensaje: 'No existe modulo con ese id',
                errors: {message: 'No existe modulo con ese id'}
            });
         }

         res.status(200).json({
            ok: true,
            modulo: moduloBorrado
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