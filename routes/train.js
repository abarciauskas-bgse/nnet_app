var express = require('express');
var router = express.Router();

/* GET training */
router.get('/', function(req, res, next) {
  res.render('train', {
    active_page: 'training'
  });
});

module.exports = router;
