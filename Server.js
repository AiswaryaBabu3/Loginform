const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 9090;
const mongoURI = "mongodb://127.0.0.1:27017/project";

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define a Mongoose schema for registration
const registrationSchema = new mongoose.Schema({
  Fullname: String,
  EmailID: String,
  ContactNumber: String,
  Gender: String,
  DateOfBirth: String,
  City: String,
  Area: String,
  Password: String,
  ProfilePhoto: String, // Update to store the path
});

// Create a model based on the schema
const Registration = mongoose.model("Registration", registrationSchema);

// Example cities and areas
const exampleCities = ["Coimbatore", "Chennai", "Madurai"];
const exampleAreas = {
  Coimbatore: ["Gandhipuram", "Peelamedu", "RS Puram"],
  Chennai: ["Anna Nagar", "T. Nagar", "Mylapore"],
  Madurai: ["Tallakulam", "Anna Nagar", "K.K. Nagar"],
};

// Multer configuration for handling file uploads
const upload = multer({ dest: 'uploads/' }); // Specify the directory for file uploads

// Endpoint to fetch the list of cities
app.get("/api/cities", (req, res) => {
  res.json({ cities: exampleCities });
});

app.get("/api/user-registrations", async (req, res) => {
  try {
    const registrations = await Registration.find();
    res.json({ registrations });
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to fetch the list of areas based on the selected city
app.get("/api/areas", (req, res) => {
  const city = req.query.city || "";
  const areas = exampleAreas[city] || [];
  res.json({ areas });
});

// Registration endpoint
app.post("/api/register", upload.single("ProfilePhoto"), async (req, res) => {
  try {
    const { Fullname, EmailID, ContactNumber, Gender, DateOfBirth, City, Area, Password } = req.body;

    // Assuming you've added the profile photo in the FormData on the client-side
    const ProfilePhoto = req.file;

    console.log("Received registration request:", { Fullname, EmailID, ContactNumber, Gender, DateOfBirth, City, Area, Password, ProfilePhoto });

    if (!Fullname || !EmailID || !ContactNumber || !Gender || !DateOfBirth || !City || !Area || !Password || !ProfilePhoto) {
      console.log("Validation failed: Missing required fields");
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Save the file to the specified directory
    const photoPath = `uploads/${ProfilePhoto.filename}`;

    // Create a new registration document with the photo path
    const registration = new Registration({
      Fullname,
      EmailID,
      ContactNumber,
      Gender,
      DateOfBirth,
      City,
      Area,
      Password,
      ProfilePhoto: photoPath,
    });

    // Save the document to the database
    const savedRegistration = await registration.save();

    console.log("Registration saved successfully:", savedRegistration);
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to fetch the profile photo
app.get("/api/profile-photo", async (req, res) => {
  try {
    const latestRegistrationWithPhoto = await Registration.findOne({
      ProfilePhoto: { $exists: true, $ne: null },
    }).sort({ _id: -1 });

    if (latestRegistrationWithPhoto) {
      res.json({
        profilePhotoUrl: latestRegistrationWithPhoto.ProfilePhoto,
      });
    } else {
      console.log("No profile photo found");
      res.status(404).json({ message: "No profile photo found" });
    }
  } catch (error) {
    console.error("Error fetching profile photo:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


