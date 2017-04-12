var db = require('mongoose'),
    Todo = db.model('Todo');

module.exports = (function(app) {
    app.route('/todos')
        .post(function(req, res) {
            var todo = new Todo();
            todo.title = req.body.title;
            todo.save(function(err) {
                if (err) {
                    res.status(500).send(err);
                }
            }).then(function() {
                res.send(todo);
            });
        })
        .get(function(req, res) {
            Todo.find({}, null, {sort: {_id: -1}}, function(err, data) {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                res.send(data);
            })
        });

    app.route('/todos/:id')
        .get(function(req, res) {
            Todo.findOne({'_id': req.params.id}, function(err, data) {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                if (!data) {
                    res.sendStatus(404);
                    return;
                }
                res.send(data);
            });
        })
        .put(function(req, res) {
            Todo.findOne({'_id': req.params.id}, function(err, data) {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                if (!data) {
                    res.sendStatus(404);
                    return;
                }

                data.title = req.body.title || data.title;
                data.done = req.body.done || data.done;

                data.save(function(err) {
                    if (err) {
                        res.status(500).send(err);
                    }
                }).then(function() {
                    res.send(data);
                });
            });
        })
        .delete(function(req, res) {
            Todo.findOne({'_id': req.params.id}, function(err, data) {
                if (err) {
                    res.status(500).send(err);
                }
                if (!data) {
                    res.sendStatus(404);
                    return;
                }
                data.remove(function(err) {
                    if (err) {
                        res.status(500).send(err);
                        return;
                    }
                    res.sendStatus(200);
                });
            });
        });
});
