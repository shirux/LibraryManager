const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const { Op } = require("sequelize");

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500).send(error);
    }
  }
}

/**
 * GET Method that retrieves the list of all books on the DB
 */
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll({ order: [['createdAt', 'DESC']]})
  res.render('books/index', { books })
}));


/**
 * GET method that renders the new book view from pug files
 */
router.get('/new', asyncHandler(async(req, res) => {
  res.render('books/new-book', { title: 'New Book', book: {}})
}));


/**
 * POST method that will try to save a book. 
 * If there is an error, it will render errors on another view.
 * Other unexpected errors just throw error
 */
router.post('/new', asyncHandler(async(req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect('/');
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      res.render('books/new-book', { book, errors: error.errors })
    } else {
      throw error
    }
  }
}))


/**
 * GET method  that will filter books by its name
 */
router.get('/search', asyncHandler(async(req, res) => {
  let search = req.query.search;
    const books = await Book.findAll({ where: {
      [Op.or]:[
        {
          title: {
            [Op.like]: `%${search}%`
          }
        },
        {
          author: {
            [Op.like]: `%${search}%`
          }
        },
        {
          genre: {
            [Op.like]: `%${search}%`
          }
        },
        {
          year: {
            [Op.like]: `%${search}%`
          }
        }
      ],
    }});
    console.dir(books)
    res.render('books/index', { books: books, title: `${search} | Books` })
  }));


/**
 * GET method that retrieves a book by its id and show its details
 */
router.get('/:id', asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id)
  if (book) {
    res.render('books/update-book', { book,  title: 'Update Book'})
  } else {
    res.render('page_not_found')
  }
}));


/**
 * POST method that tries to update a book. If book doesn't exist, throw 404.
 * If error on new info, render error form
 */
router.post('/:id', asyncHandler(async(req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id)
    if (book) {
      await book.update(req.body);
      console.log('AQUI VAMOS SUPER BIEN')
      res.redirect('/');
    } else {
      res.sendStatus(404)
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      book.id = req.params.id
      res.render('books/update-book', {book, errors: error.errors, title: 'Update Book'})
    }
  }
}))


/** 
 * DELETE method that will find a book by its id and proceed  to delete it  
 * */
router.post('/:id/delete', asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.redirect('/');
  } else {
    res.sendStatus(404)
  }
}))


module.exports = router;