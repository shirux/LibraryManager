const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const { Op } = require("sequelize");

/**
 * Handler function to wrap each route. 
 * Taken from example projects of Team TreeHouse
 */
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
  const page = (req.query.page && req.query.page > 0)  ? req.query.page - 1 : 0
  const books = await Book.findAndCountAll({ 
    limit: 5,
    offset: (page) * 5,
    order: [['createdAt', 'DESC']],
  })
  console.dir(books)
  if (books.rows.length !== 0) {
    res.render('books/index', { books: books.rows, total: books.count, page })
  } else {
    res.render('page_not_found')
  }
 
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
 * GET method  that will filter books by its name, author, genre or year
 * Case insensitive
 */
router.get('/search', asyncHandler(async(req, res) => {
  const page = (req.query.page && req.query.page > 0)  ? req.query.page - 1 : 0
  let search = req.query.search;
    const books = await Book.findAndCountAll({ where: {
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
    },
    limit: 5,
    offset: (page) * 5,
    });
    if (books.rows.length !== 0) {
      res.render('books/index', { books: books.rows, total: books.count, page, title: `${search} | Books`, search })
    } else {
      res.render('page_not_found')
    }
    
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