const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


const doesExist = function (username) {
// Iterate to find strictly equal username
  
  for (let user in users) {
    if (users[user].username === username) { //if there is at least one match, for course purpose
      return true
      break;
    } else {
      return false;
      break;
    }
  }

};


// New User registration
public_users.post("/register", function(req,res) { // username and password are required from body
  const username = req.body.username;
  const password = req.body.password;

  let newUser = {"username": username, "password": password};

  if (!username || !password) { // if no username or password provided
    res.status(403).json({message: "Error: please provide both valid username and password"});
  } else { // if username and password are provided from body check if already existing
    if (!doesExist(username)) {
      //push to list
      users.push(newUser);
      res.status(200).json({message: "Success! User successfully registered. You can now login"});
    } else {
      res.status(400).json({message: "Error: found already matching user"});
    }
  }

  // console.log(users); // remove the // for debug

});

// Retrieve book list available on the shop and send as stringified
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books, null, 4));
})

// Retrieve book by on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    let matchingBooks = [];
    
    // Iterate bookslist by ISBN
    for (let book in books) {

      if (books[book].isbn === isbn) {
        matchingBooks.push(books[book]);
      }

    };

    if (matchingBooks.length > 0) {
      res.send(matchingBooks);
    } else {
      res.status(404).json({message: "No books found by this ISBN"});
    }

  });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author; // Get the specified param
  const filteredBooks = [];

  // Iterate to get all books from filtered author

  for (let book in books) {
    if (books[book].author.toLowerCase() === author.toLowerCase()) { // toLowerCase() solves the problem of lowercase params
      filteredBooks.push(books[book]);
    } 
  }

  if (filteredBooks.lenght > 0) { // if array is not empty
    res.send(filteredBooks);
  } else { // if not empty
    res.status(404).json({message: "No books found by this author"});
  }


});

// Retrieve books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const filteredBooks = [];

  // Iterate to get all books by title

  for (let book in books) {
    if (books[book].title.toLowerCase() === title.toLowerCase()) {
      filteredBooks.push(books[book]);
      
    }
  }
  res.send(filteredBooks);

});

//  Retrieve book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  let revByIsbn = [];
  // Iterate by isbn in dict

  for (let book in books) {
    if (books[book].isbn === isbn) {
      revByIsbn.push(books[book].reviews);
      
    }
  }

  if (revByIsbn.length > 0) {
    res.send(revByIsbn);
  } else {
    res.status(404).json({message: "No reviews found by this ISBN"});
  }

});

module.exports.general = public_users;
