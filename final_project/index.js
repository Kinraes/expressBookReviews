// Absolutely NOT ready

const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
// Check authentication for user

if (req.session.authorization) {
    let atk = req.session.authorization['accessToken'];

    jwt.verify(atk, 'access', function (err, user) {
        if (!err) {
            req.user = user;
            next(); // Don't loop
        } else {
            return res.status(403).json({message: 'Error: user not yet authenticated. Please login.'});
        }
    });
} else {
    return res.status(403).json({message: 'Error: user not logged in.'});

}

});
 
const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
