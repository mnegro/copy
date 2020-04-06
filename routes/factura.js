var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Factura = require('../models/factura');

var Maquina = require('../models/maqina');

var Reparacion = require('../models/reparacion');

var Insumo = require('../models/insumo');

var isodate = require("isodate");

//============================================================
// OBTENER TODAS LAS FACTURAS
//============================================================
app.get('/', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde); 

    Factura.find({})
    .skip(desde)
    .limit(5)
    .populate('reparacion')
    .exec(
                (err, facturas)=>{

                if(err){
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Factura',
                        errors: err
                    });
                }
            Factura.count({},(err,conteo) =>{
                
                res.status(200).json({
                    ok: true,
                    facturas: facturas,
                    Total: conteo
                });
            })

            })

}); 
//============================================================
// OBTENER UNA FACTURA
//============================================================
app.get('/:id', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{

    var id= req.params.id;
    Factura.findById( id )
        .exec( (err, factura)=>{
            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar factura',
                    errors: err
                });
            }
    
            if( !factura ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La factura con el id ' + id + ' no existe',
                    errors: {message: 'No existe una factura con ese ID'}
                });
            }

            res.status(200).json({
                ok: true,
                factura: factura
            });
        })
});
//============================================================
// PAGAR FACTURAS  
//============================================================

app.put('/pagar', mdAutenticacion.verificarToken, (req,res) => {

    var id = req.params.id;
    var body = req.body;
    body.forEach(element => {
        
        Factura.findById(element._id, (err, factura) => {
    
            if(err){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar factura',
                    errors: err
                });
            }
    
            if( !factura ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La factura con el id ' + id + ' no existe',
                    errors: {message: 'No existe una factura con ese ID'}
                });
            }
    
            factura.fecha = element.fecha,
            factura.detalle = element.detalle,
            factura.paga = element.paga,
            factura.aCuenta = element.aCuenta,
            factura.reparacion = element.reparacion,
            factura.cliente = element.cliente,
            factura.total = element.total,
           
    
            factura.save( (err, facturaGuardada) => {
    
                if(err){
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar factura',
                        errors: err
                    });
                 }
    
        } )
    
    })
    });
});

//============================================================
// ACTUALIZAR UNA FACTURA  
//============================================================

app.put('/:id', mdAutenticacion.verificarToken, (req,res) => {

    var id = req.params.id;
    var body = req.body;

    Factura.findById(id, (err, factura) => {

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar factura',
                errors: err
            });
        }

        if( !factura ){

            return res.status(400).json({
                ok: false,
                mensaje: 'La factura con el id ' + id + ' no existe',
                errors: {message: 'No existe una factura con ese ID'}
            });
        }

        factura.fecha = body.fecha,
        factura.detalle = body.detalle,
        factra.insumo = body.insumo,
        factura.paga = body.paga,
        factura.aCuenta = body.aCuenta,
        factura.cliente = body.cliente,
        factura.total = body.total,
        
     

        factura.save( (err, facturaGuardada) => {

            if(err){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar factura',
                    errors: err
                });
             }

             res.status(200).json({
                ok: true,
                factura: facturaGuardada
            });

    } )

})
});
//============================================================
// CREAR UNA FACTURA   
//============================================================
app.post('/:tipo', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role] ,(req, res) => {
 
    var tipo = req.params.tipo;
    var body = req.body;
    var factura = new Factura({
        fecha: body.fecha,
        detalle: body.detalle,
        insumo: body.insumo,
        paga: body.paga,
        aCuenta: body.aCuenta,
        reparacion: body.reparacion,
        cliente: body.cliente,
        total: body.total,          
       
    });
    
        if( tipo === 'alquilada'){
            for( i=0; i< factura.detalle.length; i++ ){
                var id = factura.detalle[i].maquina._id;
                var contador = factura.detalle[i].contadorActual;
                actualizarContador(id,contador);
            }

       }
        if( tipo === 'cliente' ){
    
           for (let i = 0; i < factura.reparacion.length; i++) {
           setearReparacion( factura.reparacion[i]._id );
        
         }
      }
      if( factura.insumo.length >0 ){
          for (let i = 0; i < factura.insumo.length; i++) {
             setearInsumo( factura.insumo[i].codigo, factura.insumo[i].cantidad );
          }
      }
    
    factura.save( (err, facturaGuardada) =>{

        if(err){
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear factura',
                errors: err
            });
        }

    res.status(201).json({
        ok: true,
        factura: facturaGuardada
      
    });
    })

});

//[ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], 
//============================================================
// OBTENER FACTURAS DE UN CLIENTE
//============================================================
app.get('/cliente/:id', (req,res) =>{
    var id= req.params.id;
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Factura.find({"cliente._id":id})
           .skip(desde) 
           .populate('reparacion')
           .sort({fecha:1})
           .limit(7)
           .exec( (err, facturas)=>{
            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar Factura de ese cliente',
                    errors: err
                });
            }
    
            if( !facturas ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La factura del cliente con el id ' + id + ' no existe',
                    errors: {message: 'No existe una factura para ese cliente'}
                });
            }
           
            Factura.count({},(err,conteo) =>{
                
                res.status(200).json({
                    ok: true,
                    facturas: facturas,
                    Total: conteo
                });
            });

         
        })
});

//============================================================
// OBTENER UNA FACTURA POR FECHA
//============================================================
app.get('/factura/:id/:desde/:hasta', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{
    
    var id= req.params.id;
    var desde= req.params.desde;
    var hasta= req.params.hasta;
    console.log(id);
    console.log(desde);
    console.log(hasta);
    Factura.find( {"cliente._id": id,
                   "fecha": 
                      {
                            $gte: desde,
                            $lte: hasta}
                      }
                 )


        .exec( (err, facturas)=>{
            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar factura',
                    errors: err
                });
            }
    
            if( !facturas ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La factura con el id ' + id + ' no existe',
                    errors: {message: 'No existe una factura en esa fecha'}
                });
            }
console.log(facturas);
            res.status(200).json({
                ok: true,
                facturas: facturas
            });
        })
});

//============================================================
// ELIMINAR UNA FACTURA
//============================================================
app.delete('/:id',[ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) => {

    var id = req.params.id;

    Factura.findByIdAndRemove(id, ( err, facturaBorrada ) =>{

        if(err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar factura',
                errors: err
            });
         }

         if(!facturaBorrada){
            res.status(400).json({
                ok: false,
                mensaje: 'No existe factura con ese id',
                errors: {message: 'No existe factura con ese id'}
            });
         }

         res.status(200).json({
            ok: true,
            cliente: facturaBorrada
        });
    } )
});

function actualizarContador(id,contador){
    return new Promise((resolve,reject)=>{
        Maquina.findById(id,(err,maquina)=>{
             if(err){
            reject('Error al actualizar contador',err);
             }else{
            maquina.contador = contador;
            maquina.save( (err,maquinaActualizada)=>{
                if( err ){
                    reject('Error al actualizar el contador',err);
                }else{
                    resolve( maquinaActualizada );
                }
            });

          }  
        })
       
    })
}


function setearReparacion(id){
    return new Promise((resolve,reject)=>{
        Reparacion.findById(id,(err,reparacion)=>{
             if(err){
            reject('Error al actualizar reparacion',err);
             }else{
                    reparacion.facturada = true;
            
                    reparacion.save( (err,reparacionActualizada)=>{
                     if( err ){
                         reject('Error al actualizar el reparacion',err);
                      }else{
                             resolve( reparacionActualizada );
                      }
            });

          }  
        })
       
    })
}

function setearInsumo(codigo,cantidad){
    return new Promise((resolve,reject)=>{
        Insumo.findOne({"codigo":codigo},(err,insumo)=>{
             if(err){
            reject('Error al actualizar insumo',err);
             }else{
                    insumo.stock = insumo.stock - cantidad;
                    insumo.save( (err,insumoActualizado)=>{
                     if( err ){
                         reject('Error al actualizar el insumo',err);
                      }else{
                             resolve( insumoActualizado );
                      }
            });

          }  
        })
       
    })
}
module.exports = app; 

