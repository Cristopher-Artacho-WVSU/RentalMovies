const express = require('express')
const { connectToDb, getDB} = require('./db')
const { ObjectId } = require('mongodb')

const app = express()
app.use(express.json())


// Serve static files from the 'public' directory
app.use(express.static('public'));

//db Connection
let database

//CONNECT TO THE DATABASE
connectToDb((err) => {
    if(!err){
        //listen to port number 3000
        app.listen(3000, () => {
            console.log('App listening on port 3000')
        })
        //FETCH, UPDATE DATA
        database = getDB()
    }
    else{
        console.log(err)
    }
})


// set the view engine to ./client ejs file
app.set('view engine', 'ejs');
app.set('views', './client')
app.use(express.static('./client'));
app.use(express.static('./client/Pictures'))

//SETTING UP THE URL
app.get('/movies', (req, res) => {
    // const page = req.query.p || 0
    // const carsPerPage = 7
    let movies = []

//DISPLAYING THE COLLECTION 'cars' IN THE '/car' URL
    

    //LIMITING 7 DOCUMENTS PER PAGE
    database.collection('movies')
    .find()
    .sort({
        title: 1
    })
    // .skip(page * carsPerPage) //SKIP THE AMOUNT OF CARS TIMES THE PAGE
    // .limit(carsPerPage) //LIMIT THE AMOUNT OF CARS DISPLAYED IN ONE PAGE EQUAL TO THE VALUE
    .forEach(movie => movies.push(movie))
    // .toArray()
    .then(() =>{
        res.status(200).json(movies)
    })
    .catch(() =>{
        res.status(200).json({
            error: 'Could Not Fetch Documents'
        })
    })
})


//SINGLE DOCUMENTS ONLY
app.get('/movies/:id', (req, res) => {
    
    if (ObjectId.isValid(req.params.id)) {
        const objectId = new ObjectId(req.params.id); // Construct ObjectId instance with new keyword
    
        database.collection('movies')
            .findOne({ _id: objectId })
            .then(doc => {
                if (doc) {
                    res.status(200).json(doc);
                } else {
                    res.status(404).json({ error: 'Car not found' });
                }
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: 'Could not fetch document' });
            });
    } else {
        res.status(500).json({ error: 'Invalid Document ID' });
    }})


//CREATE DOCUMENTS (POSTMAN ONLY)
app.post('/movies', (req, res) => {
    const car = req.body
    
    database.collection('movie')
    .insertOne(car)
    .then(result => {
        res.status(201).json(result)(result.ops[0]);
    })
    .catch(err => {
        res.status(500).json({
            err: 'Could not create a new document'
        })
    })
})


//DELETE DOCUMENTS (POSTMAN ONLY)
app.delete('/movies/:id', (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
        database.collection('movies')
            .deleteOne({ _id: new ObjectId(req.params.id)})
            .then(result => {
                if (result) {
                    res.status(200).json(result);
                } else {
                    res.status(404).json({ error: 'Document Cannot be Deleted' });
                }
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: 'Could not fetch document' });
            });
    } else {
        res.status(500).json({ error: 'Invalid Document ID' });
}})

//UPDATE ONE DOCUMENT (POSTMAN ONLY)
app.patch('/movies/:id', (req, res) =>{
    const updates = req.body

    if (ObjectId.isValid(req.params.id)) {
        database.collection('movies')
            .updateOne({ _id: new ObjectId(req.params.id)}, {$set: updates})
            .then(result => {
                if (result) {
                    res.status(200).json(result);
                } else {
                    res.status(404).json({ error: 'Document Cannot be Deleted' });
                }
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: 'Could not update document' });
            });
    } else {
        res.status(500).json({ error: 'Invalid Document ID' });
}})

// Add this route in your Express app
app.get('/search', (req, res) => {
    const searchQuery = req.query.query;

    // Use a regular expression to perform a case-insensitive search
    const regex = new RegExp(searchQuery, 'i');

    database.collection('movies')
        .find({ $or: [{cost: regex}, { title: regex },{ ovn: regex }, { rate: regex }, {week_day: regex}] })
        .toArray()
        .then(results => {
            res.json(results);
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/database',(req, res) =>{
    res.render('database')
})