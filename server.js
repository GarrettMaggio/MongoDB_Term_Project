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

run.catch(console.dir);


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

async function run() {
    try {
    await client.connect();
    const projectDb = SingletonDB.get_instance();
    dbCollection = projectDb.collection("Topics");
    // temperary code to test the connection to the database and the singleton pattern
    
    

    // make the query here once input has been detected from the html page and pass it to the controller and then the controller passes it 
    // to the Model which queries the database and returns it to the controller. Which returns it here to the client

    } finally {

    }
}

