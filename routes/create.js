var express = require('express');
var router = express.Router();

/* GET training */
router.get('/', function(req, res, next) {
  res.render('create', {
    title: 'The Neural Network Explorer',
    active_page: 'create'
  });
});

module.exports = router;
