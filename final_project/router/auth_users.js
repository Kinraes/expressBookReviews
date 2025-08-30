const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("../booksdb.js").books;
let users = require("../booksdb.js").users;

const regd_users = express.Router();

let usersAuth = []; // This would typically be a database

const isValid = (username) => {
  // Check if username exists in usersAuth array
  return usersAuth.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  // Check if username and password match
  const user = usersAuth.find(user => user.username === username && user.password === password);
  return user !== undefined;
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  // Find book by ISBN
  let bookKey = null;
  for (let key in books) {
    if (books[key].isbn === isbn) {
      bookKey = key;
      break;
    }
  }

  if (!bookKey) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or modify the review
  if (!books[bookKey].reviews) {
    books[bookKey].reviews = {};
  }
  
  books[bookKey].reviews[username] = review;
  
  return res.status(200).json({ 
    message: `Review for book with ISBN ${isbn} added/updated successfully`,
    reviews: books[bookKey].reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  // Find book by ISBN
  let bookKey = null;
  for (let key in books) {
    if (books[key].isbn === isbn) {
      bookKey = key;
      break;
    }
  }

  if (!bookKey) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (books[bookKey].reviews && books[bookKey].reviews[username]) {
    delete books[bookKey].reviews[username];
    return res.status(200).json({ 
      message: `Review for book with ISBN ${isbn} deleted successfully`,
      reviews: books[bookKey].reviews
    });
  } else {
    return res.status(404).json({ message: "Review not found or unauthorized" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = usersAuth;