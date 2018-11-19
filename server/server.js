'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
// Uso del framework Loopback para el manejo del back-end en Node.js
var app = module.exports = loopback();

app.start = function() {
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Running on: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Route at: %s%s', baseUrl, explorerPath);
    }
  });
};
boot(app, __dirname, function(err) {
  if (err) throw err;
  if (require.main === module)
    app.start();
});
