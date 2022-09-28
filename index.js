const express = require("express");
const bodyParser = require("body-parser");
const connect = require("./config/db");
const path = require("path");
const router = require("./routes/userRoutes");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();

// connect mongodb database
connect();

app.use(bodyParser.json());
app.use("/", router);

// from tanwi start
// from tanwi start
app.use(cors());
app.use(express.static("doctors"));
app.use(fileUpload());

const client = new MongoClient(process.env.URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
client.connect((err) => {
  const collection = client.db("dentistDb").collection("doctors");
  const doctorsCollection = client.db("dentistDb").collection("members");
  // perform actions on the collection object
  console.log("db connected");

  app.post("/addAppointment", (req, res) => {
    const appointment = req.body;
    collection.insertOne(appointment).then((result) => {
      res.send(result);
      console.log("product added");
    });
  });

  app.post("/appointmentsByDate", async (req, res) => {
    const date = req.body;
    // console.log(date.date);
    const response = await collection
      .find({ appointmentDate: date.date })
      .toArray((err, document) => {
        res.send(document);
      });
  });

  app.post("/addDoctor", (req, res) => {
    const file = req.files.file;
    const email = req.body.email;
    const name = req.body.name;
    console.log(file, email, name);
    file.mv(`${__dirname}/doctors/${file.name}`, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ msg: "error occured" });
      }
      doctorsCollection
        .insertOne({ name, email, img: file.name })
        .then((result) => {
          console.log(result);
          res.send(result);
        });
      return res.send({ name: file.name, path: `/${file.name}` });
    });
  });

  app.get("/doctors", (req, res) => {
    doctorsCollection
      .find({})
      .sort({ updatedAt: -1 })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  // app.get("/my/appointment/:id", (req, res) => {
  //   collection.findById(req.params.id).toArray((err, documents) => {
  //     console.log(documents);
  //     console.log(err);
  //     res.send(documents);
  //   });
  // });
  // app.get("/my/appointment/:id", async (req, res) => {
  //   const response = await collection
  //     // .findById(req.params.id)
  //     .find({ _id: req.params.id })
  //     .toArray((err, document) => {
  //       res.send(document);
  //     });
  // });
});
// from tanwi end
// from tanwi end

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/build/")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}
app.listen(PORT, () => {
  console.log("Your app is running");
});
