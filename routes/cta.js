
var CC = require('../models/ctaCorriente');

var crea = function crearCta( saldo ){
    let promesa = new Promise ((resolve,reject) =>{
        var cuenta = new CC({
            total: saldo.importeTotal,
            cliente: saldo.cliente,
            
        })
        console.log('en');
       CC.find({"cliente":saldo.cliente})
       .exec((err,cta) =>{
           if(err){
               reject(err);
           }
               if(!cta){
                cuenta.save( (err, cuentaGuardada) =>{
    
                    if(err){
                       reject(err)
                    }
            
            
                  resolve(cuentaGuardada)
                })
               }
            
            if(cta)
            {
                suma(cta);
            }      
        
       })
       
    });
    return promesa;
}

var busca = function(saldo){
    console.log(saldo);

        CC.find({"cliente":saldo.cliente})
        console.log('acaa')
        console.log(saldo.cliente)
        .exec( (err, cta)=>{
            if(err){
              reject('errorr');
              console.log(err);
            }
    
            if( !cta ){

            crea( saldo.importeTotal, saldo.cliente )
                        .then()
                        .catch()
                        
            }       
            // }else{
            //     suma(cta);
            // }

    });

    return promesa;
}

var suma = function( cta ){
    CC.findById(cta._id)
    .exec( (err, cuenta)=>{
        if(err){
           return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar cta',
                errors: err
            });
        }else{
            cuenta.total += cta.importeTotal;
            cuenta.save();
        }
})
}
module.exports = {
    crea: crea,
    busca: busca
};