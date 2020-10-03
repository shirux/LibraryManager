const express = require('express');
const router = express.Router();

/* GET redirect to books page as main page */
router.get('/', (req, res, next) => {
  res.redirect("/books")
});

module.exports = router;
