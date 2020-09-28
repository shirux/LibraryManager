const express = require('express');
const router = express.Router();

/* GET book page. */
router.get('/', (req, res, next) => {
  res.redirect("/books")
});

module.exports = router;
