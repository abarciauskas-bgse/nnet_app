var express = require('express');
var router = express.Router();

/* GET training */
router.get('/', function(req, res, next) {
  res.render('create', {
    active_page: 'create'
  });
});

module.exports = router;
