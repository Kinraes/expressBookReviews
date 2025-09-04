const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("../router/booksdb.js").books;
//let users = require("../booksdb.js").users;

const regd_users = express.Router();

let authorizedUsers = []; // List for course purpose. List of dicts

const isValid = function (username) {
  // Check if username exists in authorizedUsers list -without filter()-
  // True if exists

  for (let user in authorizedUsers) {
    if (authorizedUsers[user].username === username) {
      return true;
      break;
    } else {
      return false;
      break; // break not necessary as loop stops itself, but I'll leave it there for reference.
    }
  }

}

const authenticatedUser = function (username, password) {
  // function for the /login endpoint. Filter list, return true if found valid matching, false if not.
  let validUsers = authorizedUsers.filter(function (user) {
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

  if (!username || !password) {
    return res.status(401).json({message: "Error: please provide valid username and password"});
  }
// If username and password are provided, proceed to authentication
  if (authenticatedUser(username, password)) {
    // Generate a JWT token first
    let accessToken = jwt.sign({data: password}, 'access', {expiresIn: 60 * 60});

// Store said token and associated username in session

    req.session.authorization = {accessToken, username};

    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(408).json({message: "Couldn't login. Check username and password"});
  }
});


// Add a book review. It is a "retrieve by ISBN" and a PUT for registered users only.
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;
  const targetBook = books[isbn] // stop here if there is one

  if (!targetBook) { // stop here one moment: check if there is a review in the target book's object
    return res.status(400).json({message: "Please provide a review in Review field."});
  } else {
    if (review) {
      targetBook.reviews[username] = review;
    }
    res.status(200).json({message: `Success: review for book by ISBN ${isbn} successfully updated.`})
  }
})


// Delete a book review
regd_users.delete("/auth/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  const targetBook = books[isbn];

  if(targetBook) {
    delete targetBook.reviews[username];
  }

  res.status(200).json({message: `Success: review for book with ISBN ${isbn} by user ${username} successfully deleted`})

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = authorizedUsers;