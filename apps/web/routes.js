module.exports = (function(app, passport) {
  app.get('/', function(req, res) {
    res.render('index', {
      title: 'Express.js & React Todos'
    });
  });
});
