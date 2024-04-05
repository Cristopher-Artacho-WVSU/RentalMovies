const {MongoClient} = require('mongodb');

let dbConnection;

module.exports = {
    // INITIALLY CONNECTING TO A DATABASE
    connectToDb: (cb) => {
        MongoClient.connect('mongodb://localhost:7030/RentalMovies')
            .then((client) => {
                dbConnection = client.db();
                cb(null); // Invoke the callback with null to indicate success
            })
            .catch(err => {
                console.error(err);
                cb(err); // Invoke the callback with the error if connection fails
            });
    },

    // RETURN DATABASE CONNECTION
    getDB: () => dbConnection
};
