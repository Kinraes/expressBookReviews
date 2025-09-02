const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("../router/booksdb.js").books;
//let users = require("../booksdb.js").users;

const regd_users = express.Router();

let usersAuth = []; // List for course purpose. List of dict

const isValid = (username) => {
  // Check if username exists in usersAuth list
  return usersAuth.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  // Check if username and password correspond
  const user = usersAuth.find(user => user.username === username && user.password === password);
  return user !== undefined;
}

// Block access for unregistered users
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(404).json({ message: "Error in the login process" });
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
    return res.status(408).json({ message: "Couldn't login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!review) {
    return res.status(400).json({ message: "Review field is empty!" });
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
    return res.status(404).json({ message: "Couldn't find book by ISBN" });
  }

  // Add or modify the review
  if (!books[bookKey].reviews) {
    books[bookKey].reviews = {};
  }
  
  books[bookKey].reviews[username] = review;
  
  return res.status(200).json({ 
    message: `Review for book with ISBN ${isbn} updated successfully!`,
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
    return res.status(404).json({ message: "Couldn't find a book" });
  }

  if (books[bookKey].reviews && books[bookKey].reviews[username]) {
    delete books[bookKey].reviews[username];
    return res.status(200).json({ 
      message: `Review for book with ISBN ${isbn} successfully deleted!`,
      reviews: books[bookKey].reviews
    });
  } else {
    return res.status(404).json({ message: "Review not found or access not granted" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = usersAuth;