'use strict';
const jwt = require('jsonwebtoken');
module.exports = function(User) {
  let jwtModel = null;
  const PASSPHRASE = 'example';

  const getUserByEmail = function(email) {
    return new Promise((resolve, reject) => {
      User.findOne({
        where: {
          email,
        },
      }, function(err, result) {
        if (err) reject(err);
        resolve(result);
      });
    });
  };

  const createToken = function(userId) {
    jwtModel = User.app.models.jwt;
    return new Promise((resolve, reject) => {
      const token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
        data: userId,
      }, PASSPHRASE);
      jwtModel.create({token, userId}, function(err, response) {
        if (err) reject(err);
        resolve(response);
      });
    });
  };

  const checkUserPassword = function(usuario, password) {
    return new Promise((resolve, reject) => {
      usuario.hasPassword(password, function(err, isSame) {
        if (err) reject(err);
        resolve(isSame);
      });
    });
  };

  User.sessionStart = function(body, cb) {
    const email = body.email;
    const password = body.password;
    if (!email || !password) {
      cb({
        statusCode: 404,
        message: 'Uno o más campos faltantes',
      });
    } else {
      getUserByEmail(email)
      .then(usuario => {
        if (!usuario) {
          cb({
            statusCode: 404,
            message: 'Correo inexistente',
          });
        } else {
          checkUserPassword(usuario, password)
          .then(responsePassword => {
            if (!responsePassword) {
              cb({
                statusCode: 404,
                message: 'Contraseña incorrecta',
              });
            } else {
              createToken(usuario.id)
              .then(token => {
                cb(null, {token, usuario});
              })
              .catch(err => {
                cb({
                  statusCode: 404,
                  message: 'Error al crear Token ' + err,
                });
              });
            }
          });
        }
      })
      .catch(err => {
        cb({
          statusCode: 404,
          message: 'Error al obtener el usuario ' + err,
        });
      });
    }
  };
  User.signup = function(body, cb) {
    const email = body.email;
    const password = body.password;
    if (!email || !password) {
      cb({
        statusCode: 404,
        message: 'Uno o más campos faltantes',
      });
    } else {
      getUserByEmail(email)
      .then(usuario => {
        if (usuario) {
          cb({
            statusCode: 404,
            message: 'Correo actualmente en uso',
          });
        } else {
          User.app.models.user.create({email, password}, function(err, user) {
            if (err) {
              cb({
                statusCode: 404,
                message: 'Error al registrar',
              });
            } else {
              cb(null);
            }
          });
        }
      })
      .catch(err => {
        cb({
          statusCode: 404,
          message: 'Error al obtener el usuario ' + err,
        });
      });
    }
  };
  User.remoteMethod('signup', {
    http: {
      verb: 'POST',
      path: '/signup',
    },
    accepts: {
      arg: 'body',
      type: 'object',
      http: {
        source: 'body',
      },
    },
    returns: {
      type: 'object',
      arg: 'res',
      root: true,
    },
    description: 'Registrar con email y password',
  });
  User.remoteMethod('sessionStart', {
    http: {
      verb: 'POST',
      path: '/login',
    },
    accepts: {
      arg: 'body',
      type: 'object',
      http: {
        source: 'body',
      },
    },
    returns: {
      type: 'object',
      arg: 'res',
      root: true,
    },
    description: 'Acceder con email y password',
  });
};
