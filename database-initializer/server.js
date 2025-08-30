'use strict';

// Going to connect to MySQL database
const mysql = require('mysql');
const HOST = process.env.DBHOST ? process.env.DBHOST : "127.0.0.1";
const USER = process.env.DBUSER ? process.env.DBUSER : "root";
const PASSWORD = process.env.DBPASSWORD ? process.env.DBPASSWORD : "letmein!";

const create_database_sql = `DROP DATABASE IF EXISTS events_db;
CREATE DATABASE events_db;
USE events_db;`


const create_table_sql = `CREATE TABLE events(
   id INT NOT NULL AUTO_INCREMENT,
   title VARCHAR(255) NOT NULL,
   description TEXT NOT NULL,
   location VARCHAR(255) NOT NULL,
   likes INT DEFAULT 0,
   datetime_added TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY ( id )
);
CREATE TABLE comments(
   id INT NOT NULL AUTO_INCREMENT,
   comment TEXT NOT NULL,
   event_id INT NOT NULL,
   datetime_added TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY ( id ),
   FOREIGN KEY (event_id) REFERENCES events(id)
);`

const add_record_sql = `INSERT INTO events (title, description, location) VALUES ('Pet Show Db', 'Super-fun with furry friends!', 'Dog Park');
INSERT INTO events (title,  description, location) VALUES ('Company Picnic Db', 'Come for free food and drinks.', 'At the lake');
`


async function getConnection(db) {
    try {
        return await db.createConnection(
            {
                host: HOST,
                user: USER,
                password: PASSWORD
            });
    }
    catch (err) {
        console.log(err);
        return null;
    }

}

async function init_database() {
    const connection = await getConnection(mysql);
    connection.connect().then(async function () {
            console.log("Connected!");
            // Create the database and tables
            await  connection.query(create_database_sql);
            console.log("Database created");
            await  connection.query(create_table_sql);
            console.log("Tables created");
            // Add records
            await connection.query(add_record_sql);
            console.log("Records added");
            succeeded = true;
            connection.end();
    }).catch(function (err) {
        console.error(err.message);
            connection.end();

    });
}



function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

let tries = 0;
let succeeded = false;
let sleep_time = 1;
async function start() {
    while (!succeeded && tries < 10) {
        tries++;
        init_database();
        console.log(sleep_time);
        await sleep(sleep_time * 1000);
        sleep_time >= 64 ? sleep_time = sleep_time : sleep_time *= 2
        console.log(new Date().toLocaleTimeString());
    }
    console.log("Exiting");
    process.exit();
}

start()

