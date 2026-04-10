
const {MongoClient} = require("mongodb");

const uri = "mongodb+srv://<username>:<password>@cluster1.4veezmn.mongodb.net/?appName=Cluster1";

const express = require("express");
const app = express();
const port = 3000;
app.listen(port);
console.log("server started at http://localhost:" + port);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const client = new MongoClient(uri);

class SingletonDB {
    function() {
        var instance = null;

    function get_connection() {
        const dbConnection = client.db("ProjectDataBase");
        return dbConnection;
    }

    if(!instance) {
        instance = SingletonDB.get_connection();    
    } 
    return instance;

    
};

}

// handles all the database logic
class Model {
    
    getQuery() {

    }


}


// handles anything the user sees
class View {

    defaultRoute() {
        app.get('/', function(req, res) { 

        });    
    }
    getNameRoute() {
        app.get('/say/name', function(req, res) {

        });
    }
    getTopicRoute() {
        app.get('/api/mongo/:topic', function(req, res) {

        });
    }
}

// communicates between the view and controller. The view and model never directly interact
class Controller {

    RoutePasser(determiner) {
        if (determiner == '/') {
            View.defaultRoute();            
        }
        else if (determiner == '/say/name') {
            View.getNameRoute();
        } 
        else {
            View.getTopicRoute();
        } 
    }

}

async function run() {
    try {
    await client.connect();
    const projectDb = new SingletonDB();
    dbCollection = projectDb.collection("Topics");
    var route = '/'
    
    var getpage = Controller.RoutePasser(route);

    // make the query here and pass it to the controller and then the controller passes it 
    // to the Model which queries the database and returns it to the controller. Which returns it here to the client

    } finally {

    }
}

