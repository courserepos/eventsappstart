'use strict';

console.log(`process.env.SERVER = ${process.env.SERVER}`);
// get the environment variable, but default to localhost:8082 if its not set
const SERVER = process.env.SERVER ? process.env.SERVER : "http://localhost:8082";

// express is a nodejs web server
// https://www.npmjs.com/package/express
const express = require('express');

// converts content in the request into parameter req.body
// https://www.npmjs.com/package/body-parser
const bodyParser = require('body-parser');

// express-handlebars is a templating library 
// https://www.npmjs.com/package/express-handlebars
// - look inside the views folder for the templates
// data is inserted into a template inside {{ }}
const engine = require('express-handlebars').engine;

// axios is used to make REST calls to the backend microservice
// https://www.npmjs.com/package/axios
const axios = require('axios');

// create the server
const app = express();

// ensure that the web pages are not cached 
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// set up handlbars as the templating engine
app.set('view engine', 'hbs');
app.engine('hbs', engine({
    extname: 'hbs',
    defaultView: 'default'
}));

// set up the parser to get the contents of data from html forms 
// this would be used in a POST to the server as follows:
// app.post('/route', urlencodedParser, (req, res) => {}
const urlencodedParser = bodyParser.urlencoded({ extended: false });


// defines a route that receives the request to /
app.get('/', async (req, res) => {
    try {
        /**
         * The response object contains the data returned from the server.
         * @typedef {Object} Response
         * @property {number} status - The HTTP status code of the response.
         * @property {Object} data - The data returned from the server.
         */
        const response = await axios.get(`${SERVER}/events`);
        const body = response.data;
        res.render('home', {
            layout: 'default',
            template: 'home',
            events: body.events
        });
    } catch (error) {
        console.log('error:', error);
        res.render('error_message', {
            layout: 'default',
            error: error
        });
    }
});

// create a route for the event details page that calls the backend microservice to get the event details
app.get('/event/:id', async (req, res) => {
    try {
        const response = await axios.get(`${SERVER}/event/${req.params.id}`);
        const body = response.data;
        res.render('event', {
            layout: 'default',
            template: 'event',
            event: body
        });
    } catch (error) {
        console.log('error:', error);
        res.render('error_message', {
            layout: 'default',
            error: error
        });
    }
});


// defines a route that receives the request to /
app.get('/about', (req, res) => {
      res.render('about',
        {
            layout: 'default',  //the outer html page
            template: 'index-template', // the partial view inserted into 
        }); // pass the data from the server to the template
});


// defines a route that receives the post request to /event
app.post('/event',
    urlencodedParser, // second argument - how to parse the uploaded content
    // into req.body
    async (req, res) => {
        try {
            // make a request to the backend microservice using axios
            // the URL for the backend service should be set in configuration 
            // using an environment variable. Here, the variable is passed 
            // to npm start inside package.json:
            //  "start": "SERVER=http://localhost:8082 node server.js",
            await axios.post(`${SERVER}/event`, req.body, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            res.redirect("/"); // redirect to the home page on successful response
        } catch (error) {
            console.log('error:', error); // Print the error if one occurred
            res.render('error_message', {
                layout: 'default',  //the outer html page
                error: error // pass the data from the server to the template
            });
        }
    });
 
app.post('/event/update',
    urlencodedParser, // second argument - how to parse the uploaded content
    // into req.body
    async (req, res) => {
        try {
            // make a request to the backend microservice using axios
            // the URL for the backend service should be set in configuration 
            // using an environment variable. Here, the variable is passed 
            // to npm start inside package.json:
            //  "start": "SERVER=http://localhost:8082 node server.js",
            await axios.put(`${SERVER}/event`, req.body, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            res.redirect(`/event/${req.body.id}`); // redirect to the event page on successful response
        } catch (error) {
            console.log('error:', error); // Print the error if one occurred
            res.render('error_message', {
                layout: 'default',  //the outer html page
                error: error // pass the data from the server to the template
            });
        }
    });


// defines a route that receives the post request to /event/like to like the event
app.post('/like/event',
    urlencodedParser, // second argument - how to parse the uploaded content
    // into req.body
    async (req, res) => {
        try {
            // make a request to the backend microservice using axios
            // the URL for the backend service should be set in configuration 
            // using an environment variable. Here, the variable is passed 
            // to npm start inside package.json:
            //  "start": "BACKEND_URL=http://localhost:8082 node server.js",
            await axios.put(`${SERVER}/like/event`, req.body, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            res.redirect("/"); // redirect to the home page on successful response
        } catch (error) {
            console.log('error:', error); // Print the error if one occurred
            res.render('error_message', {
                layout: 'default',  //the outer html page
                error: error // pass the data from the server to the template
            });
        }
    });


// defines a route that receives the delete request to /event/like to unlike the event
app.post('/event/unlike',
    urlencodedParser, // second argument - how to parse the uploaded content
    // into req.body
    async (req, res) => {
        try {
            // make a request to the backend microservice using axios
            // the URL for the backend service should be set in configuration 
            // using an environment variable. Here, the variable is passed 
            // to npm start inside package.json:
            //  "start": "BACKEND_URL=http://localhost:8082 node server.js",
            await axios.delete(`${SERVER}/like/event`, {
                data: req.body,
                headers: {
                    "Content-Type": "application/json"
                }
            });
            res.redirect("/"); // redirect to the home page on successful response
        } catch (error) {
            console.log('error:', error); // Print the error if one occurred
            res.render('error_message', {
                layout: 'default',  //the outer html page
                error: error // pass the data from the server to the template
            });
        }
    });
    
// defines a route that receives the delete request to /event/delete/:id to delete the event
app.get('/event/delete/:id',
    urlencodedParser, // second argument - how to parse the uploaded content
    // into req.body
    async (req, res) => {
        try {
            await axios.delete(`${SERVER}/event/${req.params.id}`);
            res.redirect("/"); // redirect to the home page on successful response
        } catch (error) {
            console.log('error:', error); // Print the error if one occurred
            res.render('error_message', {
                layout: 'default',  //the outer html page
                error: error // pass the data from the server to the template
            });
        }
    });


// create a post route to add a comment to an event
app.post('/comment',
    urlencodedParser, // second argument - how to parse the uploaded content
    // into req.body
    async (req, res) => {
        try {
            const response = await axios.post(`${SERVER}/comment`, req.body, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            res.redirect(`/event/${req.body.event_id}`); // redirect to the event page on successful response
        } catch (error) {
            console.log('error:', error); // Print the error if one occurred
            res.render('error_message', {
                layout: 'default',  //the outer html page
                error: error // pass the data from the server to the template
            });
        }
    });


// create a post route to delete a comment from an event
app.get('/comment/delete/:event_id/:id',
    urlencodedParser, // second argument - how to parse the uploaded content
    // into req.body
    async (req, res) => {
        try {
            const eventId = req.params.event_id;
            await axios.delete(`${SERVER}/comment/${eventId}/${req.params.id}`);
            res.redirect(`/event/${eventId}`); // redirect to the event page on successful response
        } catch (error) {
            console.log('error:', error); // Print the error if one occurred
            res.render('error_message', {
                layout: 'default',  //the outer html page
                error: error // pass the data from the server to the template
            });
        }
    });

// create other get and post methods here - version, login,  etc





// generic error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
});

// specify the port and start listening
const SERVICE_PORT = process.env.SERVICE_PORT ? process.env.SERVICE_PORT : 8080;
const server = app.listen(SERVICE_PORT, () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log(`Events app listening at http://${host}:${port}`);
});

module.exports = app;