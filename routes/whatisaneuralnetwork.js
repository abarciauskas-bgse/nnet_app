var express = require('express');
var router = express.Router();

/* GET training */
router.get('/', function(req, res, next) {
  res.render('whatisaneuralnetwork', {
    title: 'The Neural Network Explorer',
    active_page: 'whatisaneuralnetwork'
  });
});

module.exports = router;
