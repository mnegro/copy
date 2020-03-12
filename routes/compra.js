var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Compra = require('../models/compra');

var Repuesto = require('../models/repuesto');

var Insumo = require('../models/insumo');
//============================================================
// OBTENER TODOS LAS COMPRAS
//============================================================
app.get('/:paginado/:desde', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req, res, next) => {

    var desde = req.params.desde || 0;
    desde = Number(desde); 

    Compra.find({})
    .skip(desde)
    .limit(7)
   .populate('proveedor')
   .sort({fecha:-1})
    .exec(
                (err, compras)=>{

                if(err){
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando compra',
                        errors: err
                    });
                }

            Compra.count({},(err,conteo) =>{
                
                res.status(200).json({
                    ok: true,
                    compras: compras,
                    Total: conteo
                });
            })

            })

}); 
//============================================================
// OBTENER UNA COMPRA 
//============================================================
app.get('/:id', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{

    var id= req.params.id;
    Compra.findById( id )
        // .populate('maquina')
        .exec( (err, compra)=>{
            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar compra',
                    errors: err
                });
            }
    
            if( !compra ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La compra con el id ' + id + ' no existe',
                    errors: {message: 'No existe una compra con ese ID'}
                });
            }

            res.status(200).json({
                ok: true,
                compra: compra
            });
        })
});
//============================================================
// ACTUALIZAR UNA COMPRA   
//============================================================

app.put('/:id', mdAutenticacion.verificarToken, (req,res) => {

    var id = req.params.id;
    var body = req.body;

    Compra.findById(id, (err, compra) => {

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar compra',
                errors: err
            });
        }

        if( !compra ){

            return res.status(400).json({
                ok: false,
                mensaje: 'El cliente con el id ' + id + ' no existe',
                errors: {message: 'No existe un cliente con ese ID'}
            });
        }

        compra.fecha = body.fecha,
        compra.proveedor = body.proveedor,
        compra.repuestos = body.repuestos,
        compra.insumos = body.insumos,
        compra.total = body.total
     
        var subTotalRepuesto =0;
        var subTotalInsumo =0;
        if( compra.repuestos.length > 0){
            compra.repuestos.forEach(element => {
                element.subTotal= element.costoUnidad * element.cantidad;
                subTotalRepuesto+= element.subTotal;
                actualizaRepuesto(element).then().catch();
            });
    
        }
        if( compra.insumos.length >0 ){
            compra.insumos.forEach(element=> {
                element.subTotal= element.costoUnidad * element.cantidad;
                subTotalInsumo += element.subTotal;
                actualizaInsumo(element).then().catch();
            });
    
        }
        compra.total = subTotalRepuesto + subTotalInsumo;
        compra.save( (err, compraGuardada) => {

            if(err){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar compra',
                    errors: err
                });
             }

             res.status(200).json({
                ok: true,
                compra: compraGuardada
            });

    } )

})
});
//============================================================
// CREAR UNA COMPRA  
//============================================================
app.post('/', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role] ,(req, res) => {

    var body = req.body;
 
    var compra = new Compra({
        fecha: body.fecha,
        proveedor: body.proveedor,
        repuestos: body.repuestos,
        insumos: body.insumos,
        total: body.total
    });

    if( compra.repuestos.length > 0){
        compra.repuestos.forEach(element => {
            element.subTotal= element.costoUnidad * element.cantidad;
            compra.total += element.subTotal;
            actualizaRepuesto(element).then().catch();
        });

    }
    if( compra.insumos.length >0 ){
        compra.insumos.forEach(element=> {
            element.subTotal= element.costoUnidad * element.cantidad;
            compra.total += element.subTotal;
            actualizaInsumo(element).then().catch();
        });

    }
    compra.save( (err, compraGuardada) =>{

        if(err){
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear compra',
                errors: err
            });
        }


    res.status(201).json({
        ok: true,
        compra: compraGuardada
      
    });
    })

});
//============================================================
// OBTENER UNA COMPRA POR FECHA
//============================================================
app.get('/compra/:desde/:hasta', [ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) =>{
    
    var id= req.params.id;
    var desde= req.params.desde;
    var hasta= req.params.hasta;
    console.log(desde);
    console.log(hasta);
    Compra.find( {
                   "fecha": 
                      {
                            $gte: desde,
                            $lte: hasta}
                      }
                 )

     .populate('proveedor')
        .exec( (err, compras)=>{
            if(err){
               return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar factura',
                    errors: err
                });
            }
    
            if( !compras ){
    
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La compra con el id ' + id + ' no existe',
                    errors: {message: 'No existe una compra en esa fecha'}
                });
            }
console.log(compras);
            res.status(200).json({
                ok: true,
                compras: compras
            });
        })
});


//============================================================
// ELIMINAR UNA COMPRA
//============================================================
app.delete('/:id',[ mdAutenticacion.verificarToken, mdAutenticacion.verificarAdmin_Role], (req,res) => {

    var id = req.params.id;

    Compra.findByIdAndRemove(id, ( err, compraBorrada ) =>{

        if(err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar compra',
                errors: err
            });
         }

         if(!compraBorrada){
            res.status(400).json({
                ok: false,
                mensaje: 'No existe compra con ese id',
                errors: {message: 'No existe compra con ese id'}
            });
         }

         res.status(200).json({
            ok: true,
            compra: compraBorrada
        });
    } )
});

function actualizaRepuesto(actualizado){
    return new Promise((resolve, reject) =>{
      console.log(actualizado)
        Repuesto.findById(actualizado._id,(err, repuesto)=>{
            console.log(repuesto);

            if(err){
                reject('Error al buscar repuesto', err);
            }else{

                repuesto.stock = repuesto.stock + actualizado.cantidad;
                repuesto.costo = actualizado.costoUnidad;
                if( repuesto.porcAplicado != null ){
                    repuesto.precio = actualizado.costoUnidad + ((actualizado.costoUnidad  * repuesto.porcAplicado)/100);
                }
                console.log(repuesto);
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
function actualizaInsumo(actualizado){
    return new Promise((resolve, reject) =>{
      console.log(actualizado)
        Insumo.findById(actualizado._id,(err, insumo)=>{
            console.log(insumo);

            if(err){
                reject('Error al buscar insumo', err);
            }else{

                insumo.stock = insumo.stock + actualizado.cantidad;
                insumo.costo = actualizado.costoUnidad;
                if( insumo.porcAplicado != null ){
                    insumo.precio = actualizado.costoUnidad + ((actualizado.costoUnidad  * insumo.porcAplicado)/100);
                }
                console.log(insumo);
                insumo.save( (err, insumoGuardado) => {
                    if(err){
                        reject('Error al actualizar insumo', err)
            
                         }else{
                             resolve(insumoGuardado);
                         }
                        
                        });
             }
            
        
         
            })
        
        });
        
 };


module.exports = app; 

