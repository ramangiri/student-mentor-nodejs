require("dotenv").config();
const express = require("express");
const mongodb = require("mongodb");
const mongoClient = require('mongodb');
const dbUrl = "mongodb+srv://student-mentor:Ye7XMbvkDdDdOfKI@cluster0.npjnd.mongodb.net"
  
let objectId = mongodb.ObjectID;
const app = express();
const port = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Hello server is up and running");
});

app.use(express.json());

app.get("/mentor", (req, res) => {
  mongoClient.connect(dbUrl, (err, client) => {
    if (err) throw err;
    let db = client.db("Guvi");
    db.collection("mentor")
      .find()
      .toArray()
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((error) => {
        res.status(400).json({
          message: "Data not found",
          error,
        });
      });
  });
});

app.get("/student", (req, res) => {
  mongoClient.connect(dbUrl, (err, client) => {
    if (err) throw err;
    let db = client.db("Guvi");
    db.collection("student")
      .find()
      .toArray()
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((error) => {
        res.status(400).json({
          message: "Data not found",
          error,
        });
      });
  });
});

app.post("/create-mentor", async (req, res) => {
  try {
    let client = await mongoClient.connect(dbUrl);
    let db = client.db("Guvi");
    await db.collection("mentor").insertOne(req.body);
    res.status(200).json({
      message: "Mentor created",
    });
    client.close();
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

app.post("/create-student", async (req, res) => {
  try {
    let client = await mongoClient.connect(dbUrl);
    let db = client.db("Guvi");
    await db.collection("student").insertOne(req.body);
    res.status(200).json({
      message: "Student created",
    });
    client.close();
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

app.put("/update-mentor/:name", async (req, res) => {
  try {
    let name = req.params.name;
    
    req.body.Students.forEach(async (obj) => {
      let client = await mongoClient.connect(dbUrl);
      let db = client.db("Guvi");
    
      let student_data = await db.collection("student").find({ name: obj }).toArray();
      if (!student_data[0].mentor) {
        await db.collection("student").findOneAndUpdate({ name: obj }, { $set: { mentor: name } }); 
        await db.collection("mentor").findOneAndUpdate({ name },{$addToSet : {Students  : { $each: [obj] }}});
        
      }
       
    }); 
    res.status(200).json({
      message: "Mentor created",
    });   
    
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

app.put("/update-student-mentor/:studentName", async (req, res) => {
  try {
    let name = req.params.studentName;
    let client = await mongoClient.connect(dbUrl);
    let db = client.db("Guvi");
    let student_data = await db.collection("student").find({ name }).toArray();
    let mentor_data = student_data[0].mentor;
    await db.collection("student").findOneAndUpdate({ name }, { $set: { mentor: req.body.mentor } });
    await db.collection("mentor").findOneAndUpdate({ name: req.body.mentor },{$addToSet : {Students  : { $each: [name] }}});
    await db.collection("mentor").findOneAndUpdate({ name: mentor_data },{$pull : {Students  : name}});
    res.status(200).json({
      message: "Mentor Updated",
    });   
    
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

app.get("/studentlist/:mentor", async (req, res) => {
  let client = await mongoClient.connect(dbUrl);
  let db = client.db("Guvi");
  let mentor = await db.collection("mentor").find({ name: req.params.mentor }).toArray();
  if(mentor){
  res.status(200).json({
    message: "Student Details of Mentor",
    data : mentor[0].Students
  });
  }
  else{
    res.status(404).json({
      message:"No mentor data found"
    })
  }
});



app.listen(port, () => {
  console.log("You are using the port" + port);
});
