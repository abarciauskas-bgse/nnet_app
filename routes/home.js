var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', {
    title: 'The Neural Network Explorer',
    active_page: 'home'
  });
});

module.exports = router;
