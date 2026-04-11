
const {MongoClient} = require("mongodb");

const uri = "mongodb+srv://<userName>:<passWord>@cluster1.4veezmn.mongodb.net/?appName=Cluster1";

const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
app.listen(port);
console.log("server started at http://localhost:" + port);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const client = new MongoClient(uri);

class SingletonDB {
    static instance = null;

        static get_connection() {
            const dbConnection = client.db("ProjectDataBase");
            return dbConnection;
        }
        
        static get_instance() {
            if(!SingletonDB.instance) {
                SingletonDB.instance = SingletonDB.get_connection();    
            } 
            return SingletonDB.instance;
        }
}


// handles all the database logic
class Model {
    
    getQuery(req, route) {
        if (route == '/') {
            // this route should only retrieve the two most recent messages from the topics that the user has subscribed to.
        }
        else if (route == '/say/name') {

        }
        else {

        }
    }


}


// handles anything the user sees
class View {

    defaultRoute() {
        app.get('/', function(req, res) {
            // send the html page to the client to be displayed.
            // __dirname is the current directory of this file and then the html file is choses to be sent to the client.
           res.sendFile(path.join(__dirname, 'displayPage.html')); 
        });
    }
    // these two routes should only be called once the user clicks a button on the html page.
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
        // these two routes should only be called once the user clicks a button on the html page.
        else if (determiner == '/say/name') {
            View.getNameRoute();
        } 
        else { // get the topic route
            View.getTopicRoute();
        } 
    }
    
    QueryManager(route) {
        Model.getQuery(route);
    }

}

// notifes the view of any changes to the model. The view should update itself based on the changes to the model.
class Observer {

}


async function run() {
    try {
    await client.connect();
    const projectDb = SingletonDB.get_instance();
    dbCollection = projectDb.collection("Topics");
    // temperary code to test the connection to the database and the singleton pattern
    const query = {topic: "test"};
    const result = await dbCollection.findOne(query);
    console.log(result);
    var route = '/';
    
    Controller.RoutePasser(route);
    Controller.QueryManager(route);

    // make the query here once input has been detected from the html page and pass it to the controller and then the controller passes it 
    // to the Model which queries the database and returns it to the controller. Which returns it here to the client

    } finally {

    }
}
run.catch(console.dir);
