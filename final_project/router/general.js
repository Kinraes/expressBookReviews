const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



// New User registration
public_users.post("/register", function (req,res) {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({'username': username, 'password': password});
      return res.status(200).json({message: 'Success: User registered. You can now login.'});
    } else {
      return res.status(403).json({message: 'Error: User already exists!'});
    }
  }

  return res.status(404).json({message: "Error: couldn't register user."});
});

// Retrieve book list available on the shop and send as stringified
public_users.get('/',function (req, res) {
  
  res.send(JSON.stringify(books, null, 4));
});

// Retrieve books filtering bi ISBN (no filter method required)
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  // iterate in dict books

  for (let book in books) {
    if (books[book].isbn === isbn) {
      return res.send(books[book]);
    }
  }

  return res.status(404).json({message: "Couldn't find book"});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author; // Get the specified parameter from body
  const filteredBooks = [];

  // Iterate to get all books from filtered author

  for (let book in books) {
    if (books[book].author.toLowerCase() === author.toLowerCase()) {
      filteredBooks.push(books[book]);
    }
  }
  // If at least one is found, aka if at least one ended up in the list
  if (filteredBooks.length > 0) {
    return res.send(filteredBooks);
  } else {
    return res.status(404).json({message: "Couldn't find any book by this author."})
  }
  
});

// Retrieve books based on title
public_users.get('/title/:title',function (req, res) {
  const byTitle = req.params.title;
  const filteredBooks = [];

  // Iterate to get all books by title
  for (let book in books) {
    if (books[book].title.toLowerCase().includes(title.toLowerCase())) {
      filteredBooks.push(books[book]);
    }
  }

  if (filteredBooks.length > 0) {
    return res.send(filteredBooks);
  } else {
    return res.status(404).json({message: "Couldn't find any book by this title"});
  }
  
});

//  Retrieve book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  // Iterate by isbn in dict
  for (let book in books) {
    if (books[book].isbn === isbn) {
      return res.send(books[book].reviews);
    }
  }
});

module.exports.general = public_users;
