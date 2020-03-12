var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

//============================================================
// VERIFICAR TOKEN   
//============================================================
exports.verificarToken = function( req, res, next ) {

    var token = req.query.token;

    jwt.verify( token, SEED, (err, decoded ) => {
 
        if(err){
           return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
        req.usuario = decoded.usuario;
        next();

    });

}

//============================================================
// VERIFICAR ADMIN_ROLE   
//============================================================
exports.verificarAdmin_Role = function( req, res, next ) {

    var usuario = req.usuario;
    
    if( usuario.role === 'ADMIN_ROLE' ){
            //si es ADMIN_ROLE continuo los procesos con la istruccion next()
        next();
        return;
    }else{
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador',
            errors: { message: 'No es Administrador, no puede hacer eso' }
        });
    }

}

//============================================================
// VERIFICAR ADMIN_ROLE  o MISMO USUARIO
//============================================================
exports.verificarAdmin_o_MismoUsuario= function( req, res, next ) {

    var usuario = req.usuario;
    var id = req.params.id;
    
    if( usuario.role === 'ADMIN_ROLE' || usuario._id === id ){
            //si es ADMIN_ROLE continuo los procesos con la istruccion next()
        next();
        return;
    }else{
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador ni es el mismo usuario',
            errors: { message: 'No es Administrador, no puede hacer eso' }
        });
    }

}

