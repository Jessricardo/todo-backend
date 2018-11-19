'use strict';

module.exports = function(List) {
  List.beforeRemote('*', function(ctx, thing, next) {
    if (ctx.req.headers.authorization) {
      const token = ctx.req.headers.authorization.replace('Bearer ', '');
      const JWT = List.app.models.jwt;
      JWT.findOne({where: {token}}, (err, user) => {
        if (err || !user) {
          next(new Error('Token no encontrado'));
        } else {
          next();
        }
      });
    } else {
      next(new Error('Debes estar logueado para entrar'));
    }
  });
};
