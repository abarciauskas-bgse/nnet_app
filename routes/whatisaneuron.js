var express = require('express');
var router = express.Router();

/* GET training */
router.get('/', function(req, res, next) {
  res.render('whatisaneuron', {
    active_page: 'whatisaneuron'
  });
});

module.exports = router;
