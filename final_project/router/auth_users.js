const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("../router/booksdb.js").books;
//let users = require("../booksdb.js").users;

const regd_users = express.Router();

let usersAuth = []; // List for course purpose. List of dicts

const isValid = function (username) {
  // Check if username exists in usersAuth list
  // True if exists

  for (let user in usersAuth) {
    if (usersAuth[user].username === username) {
      return true;
      break;
    } else {
      return false;
      break; // break not necessary, but I'll leave it there for reference.
    }
  }

}

const authenticatedUser = function (username, password) {
  // function for the /login endpoint. Filter list, return true if found valid matching, false if not.
  let validUsers = users.filter(function (user) {
    return (user.username === username && user.password === password); // filter function and return single strictly equal match.
  });

  if (validUsers.length > 0) { // if returned match exists return true, otherwise false.
    return true;
  } else {
    return false;
  };
};

// Login endpoint
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  console.log('Login with: '+ username + ' ' + password);

  if (!username || !password) {
    return res.status(401).json({message: "Error: please provide valid username and password"});
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({data: password}, 'access', {expiresIn: 60 * 60});

    req.session.authorization = {accessToken, username};
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(408).json({message: "Couldn't login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!review) {
    return res.status(400).json({message: "Please provide a review in Review field."});
  }

  // Find book by ISBN

  let matchingBooks = null;

  for (let book in books) {
    if (books[book].isbn === isbn) {
      
      matchingBooks = books[book];
      return  matchingBooks;

    } else {

      return res.status(404).json({message: "Couldn't find book by ISBN"});

    }
  }


  // Add/Modify review of returned book
  if (!matchingBooks.reviews) {
    matchingBooks.reviews = {};
  }
  
  matchingBooks.reviews[username] = review;
  
  return res.status(200).json({message: `Review for book with ISBN ${isbn} updated successfully!`, reviews: matchingBooks.reviews});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  // Find book by ISBN
  let matchingBooks = null;
  for (let book in books) {
    if (books[book].isbn === isbn) {
      matchingBooks = book;
      break;
    }
  }

  if (!matchingBooks) {
    return res.status(404).json({ message: "Couldn't find a book with given ISBN" });
  }

  if (books[matchingBooks].reviews && books[matchingBooks].reviews[username]) {
    delete books[matchingBooks].reviews[username];
    return res.status(200).json({message: `Review for book with ISBN ${isbn} successfully deleted!`, reviews: books[matchingBooks].reviews});
  } else {
    return res.status(404).json({message: "Review not found or access not granted"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = usersAuth;