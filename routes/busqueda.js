var express = require('express');

var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');
var Repuesto = require('../models/repuesto');
var Cliente = require('../models/cliente');
var Maqina = require('../models/maqina');
var Proveedor = require('../models/proveedor'); 
var Insumo = require('../models/insumo');
var Modulo = require('../models/modulo');
//===============================================
//============BUSQUEDA POR COLECCION=============
//===============================================

app.get('/coleccion/:tabla/:busqueda', (req, res)=>{
   
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var promesa;
    var regex = new RegExp(busqueda, 'i');

    switch( tabla ){

        case 'usuarios':
             promesa = buscarUsuarios (busqueda, regex);
        break;

        case 'medicos':
             promesa = buscarMedicos (busqueda, regex);
        break;

        case 'hospitales':
             promesa = buscarHospitales (busqueda, regex);
        break;

        case 'repuestos':
             promesa = buscarRepuestos (busqueda, regex);
        break;
     
        case 'clientes':
             promesa = buscarClientes (busqueda, regex);
        break;
        case 'maquinas':
             promesa = buscarMaquinas (busqueda, regex);
        break;
        case 'proveedores':
             promesa = buscarProveedores (busqueda, regex);
        break;
        case 'insumos':
             promesa = buscarInsumos (busqueda, regex);
        break;
        case 'modulos':
             promesa = buscarModulo (busqueda, regex);
        break;
       
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo pueden ser: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/coleccion no valido'}

            });
    }

    promesa.then( data =>{
        res.status(200).json({ 
            ok: true,
            [tabla]: data
         });
    })

});

//===============================================
//==============BUSQUEDA GENERAL=================
//===============================================

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {

            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });

        })

});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales)
                }
            });

    });

}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos)
                }
            });

    });

}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email img role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });

    });

}

function buscarRepuestos(busqueda, regex) {
    var listaRepuestos = []
    return new Promise((resolve, reject) => {

        Repuesto.find({})
          .or([{ 'tipo': regex }, { 'codigo': regex }])
            .exec((err, repuestos) => {

                if (err) {
                    reject('Error al cargar repuestos', err);
                } else {
                    repuestos.forEach(rep => {
                        if( !rep.eliminado ){
                            listaRepuestos.push(rep);
                            
                        }
                    });
                    resolve(listaRepuestos);
                }
            });

    });

}
function buscarInsumos(busqueda, regex) {
    var listaINsumos = []
    return new Promise((resolve, reject) => {

        Insumo.find({})
          .or([{ 'tipo': regex }, { 'codigo': regex }])
            .exec((err, insumos) => {

                if (err) {
                    reject('Error al cargar insumos', err);
                } else {
                    insumos.forEach(ins => {
                        if( !ins.eliminado ){
                            listaINsumos.push(ins);
                            
                        }
                    });
                    resolve(listaINsumos);
                }
            });

    });

}
function buscarModulo(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Modulo.find({})
          .or([{ 'codigo': regex }])
            .exec((err, modulos) => {

                if (err) {
                    reject('Error al cargar modulos', err);
                } else {
                    resolve(modulos);
                }
            });

    });

}

function buscarClientes(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Cliente.find({})
        .or([{ 'nombre': regex }, { 'apellido': regex },{'razonSocial': regex }])
            .exec((err, clientes) => {

                if (err) {
                    reject('Error al cargar clientes', err);
                } else {
                    resolve(clientes);
                }
            });

    });

}

function buscarMaquinas(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Maqina.find({})
        .populate('cliente')
        .or([{ 'modelo': regex }, { 'serie': regex }])
            .exec((err, maquinas) => {

                if (err) {
                    reject('Error al cargar maquinas', err);
                } else {
                    resolve(maquinas);
                }
            });

    });

}

function buscarProveedores(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Proveedor.find({})
        .or([{ 'empresa': regex }, { 'cuit': regex }])
            .exec((err, proveedores) => {

                if (err) {
                    reject('Error al cargar proveedores', err);
                } else {
                    resolve(proveedores);

                }
            });

    });


}
module.exports = app;