const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const mongoose = require("mongoose");
const { Types } = require("mongoose");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Database setup
const db = new sqlite3.Database("./cocktails.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
    initDatabase();
  }
});

const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const unique =
      base.replace(/[^a-zA-Z0-9_-]/g, "_") + "-" + Date.now() + ext;
    cb(null, unique);
  },
});
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowed = ["image/jpeg", "image/png"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG and PNG images are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Mongoose (MongoDB) setup
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/mongoLaura";
// process.env.MONGO_URI ||
// "mongodb+srv://michaeliyer:ass100ASS@cluster0.s9vduqy.mongodb.net/mongoLaura";
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB via Mongoose."))
  .catch((err) => console.error("MongoDB connection error:", err));

const cocktailSchema = new mongoose.Schema({
  theCock: { type: String, required: true },
  theIngredients: { type: String, required: true },
  theRecipe: { type: String, required: true },
  theJpeg: { type: String },
  theComment: { type: String },
  created_at: { type: Date, default: Date.now },
});

const Cocktail = mongoose.model("Cocktail", cocktailSchema);

// Initialize database with table
function initDatabase() {
  const createTable = `
    CREATE TABLE IF NOT EXISTS cocktails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      theCock TEXT NOT NULL,
      theIngredients TEXT NOT NULL,
      theRecipe TEXT NOT NULL,
      theJpeg TEXT,
      theComment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(createTable, (err) => {
    if (err) {
      console.error("Error creating table:", err.message);
    } else {
      console.log("Cocktails table created or already exists.");
      // Import initial data from allCocktails.js
      importInitialData();
    }
  });
}

// Import initial data from allCocktails.js
function importInitialData() {
  db.get("SELECT COUNT(*) as count FROM cocktails", (err, row) => {
    if (err) {
      console.error("Error checking table:", err.message);
      return;
    }

    if (row.count === 0) {
      // Import the initial cocktails from allCocktails.js
      const initialCocktails = [
        {
          theCock: "Hot Rüuski",
          theIngredients: "Wodka, Peat Moss, Pine Tar",
          theRecipe: "Take your ingredients, mix, serve",
          theJpeg: null,
          theComment: "A couple of these, you'll forget all your problems!",
        },
        {
          theCock: "Cold Soul",
          theIngredients: "Wodka, Ice, Herbs",
          theRecipe: "Gather your ingredients, combine, shake, serve over ice",
          theJpeg: null,
          theComment: "Have one or six of these, and discuss the future!",
        },
      ];

      const insertStmt = db.prepare(`
        INSERT INTO cocktails (theCock, theIngredients, theRecipe, theJpeg, theComment)
        VALUES (?, ?, ?, ?, ?)
      `);

      initialCocktails.forEach((cocktail) => {
        insertStmt.run(
          cocktail.theCock,
          cocktail.theIngredients,
          cocktail.theRecipe,
          cocktail.theJpeg,
          cocktail.theComment
        );
      });

      insertStmt.finalize((err) => {
        if (err) {
          console.error("Error importing initial data:", err.message);
        } else {
          console.log("Initial cocktails imported successfully.");
        }
      });
    }
  });
}

// API Routes

// Get all cocktails
app.get("/api/cocktails", async (req, res) => {
  try {
    const cocktails = await Cocktail.find().sort({ created_at: -1 });
    res.json(cocktails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  // SQLite version (now replaced by MongoDB):
  // const query = "SELECT * FROM cocktails ORDER BY created_at DESC";
  // db.all(query, [], (err, rows) => {
  //   if (err) {
  //     res.status(500).json({ error: err.message });
  //     return;
  //   }
  //   res.json(rows);
  // });
});

// Get single cocktail by ID
app.get("/api/cocktails/:id", async (req, res) => {
  try {
    const cocktail = await Cocktail.findById(req.params.id);
    if (!cocktail) {
      return res.status(404).json({ error: "Cocktail not found" });
    }
    res.json(cocktail);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  // SQLite version (now replaced by MongoDB):
  // const query = "SELECT * FROM cocktails WHERE id = ?";
  // db.get(query, [req.params.id], (err, row) => {
  //   if (err) {
  //     res.status(500).json({ error: err.message });
  //     return;
  //   }
  //   if (!row) {
  //     res.status(404).json({ error: "Cocktail not found" });
  //     return;
  //   }
  //   res.json(row);
  // });
});

// Create new cocktail
app.post("/api/cocktails", async (req, res) => {
  const { theCock, theIngredients, theRecipe, theJpeg, theComment } = req.body;

  if (!theCock || !theIngredients || !theRecipe) {
    return res
      .status(400)
      .json({ error: "Cocktail name, ingredients, and recipe are required" });
  }

  try {
    const newCocktail = new Cocktail({
      theCock,
      theIngredients,
      theRecipe,
      theJpeg,
      theComment,
    });
    const savedCocktail = await newCocktail.save();
    res.json(savedCocktail);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  // SQLite version (now replaced by MongoDB):
  // const query = `
  //   INSERT INTO cocktails (theCock, theIngredients, theRecipe, theJpeg, theComment)
  //   VALUES (?, ?, ?, ?, ?)
  // `;
  // db.run(
  //   query,
  //   [theCock, theIngredients, theRecipe, theJpeg, theComment],
  //   function (err) {
  //     if (err) {
  //       res.status(500).json({ error: err.message });
  //       return;
  //     }
  //     res.json({
  //       id: this.lastID,
  //       theCock,
  //       theIngredients,
  //       theRecipe,
  //       theJpeg,
  //       theComment,
  //     });
  //   }
  // );
});

// Update cocktail
app.put("/api/cocktails/:id", async (req, res) => {
  const { theCock, theIngredients, theRecipe, theJpeg, theComment } = req.body;

  if (!theCock || !theIngredients || !theRecipe) {
    return res
      .status(400)
      .json({ error: "Cocktail name, ingredients, and recipe are required" });
  }

  try {
    const id = Types.ObjectId.isValid(req.params.id)
      ? new Types.ObjectId(req.params.id)
      : req.params.id;
    const updated = await Cocktail.findOneAndUpdate(
      { _id: id },
      { theCock, theIngredients, theRecipe, theJpeg, theComment },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Cocktail not found" });
    }
    res.json({ message: "Cocktail updated successfully" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: err.message });
  }
  // SQLite version (now replaced by MongoDB):
  // const query = `
  //   UPDATE cocktails
  //   SET theCock = ?, theIngredients = ?, theRecipe = ?, theJpeg = ?, theComment = ?
  //   WHERE id = ?
  // `;
  // db.run(
  //   query,
  //   [theCock, theIngredients, theRecipe, theJpeg, theComment, req.params.id],
  //   function (err) {
  //     if (err) {
  //       res.status(500).json({ error: err.message });
  //       return;
  //     }
  //     if (this.changes === 0) {
  //       res.status(404).json({ error: "Cocktail not found" });
  //       return;
  //     }
  //     res.json({ message: "Cocktail updated successfully" });
  //   }
  // );
});

// Delete cocktail
app.delete("/api/cocktails/:id", async (req, res) => {
  try {
    const deleted = await Cocktail.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Cocktail not found" });
    }
    res.json({ message: "Cocktail deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  // SQLite version (now replaced by MongoDB):
  // const query = "DELETE FROM cocktails WHERE id = ?";
  // db.run(query, [req.params.id], function (err) {
  //   if (err) {
  //     res.status(500).json({ error: err.message });
  //     return;
  //   }
  //   if (this.changes === 0) {
  //     res.status(404).json({ error: "Cocktail not found" });
  //     return;
  //   }
  //   res.json({ message: "Cocktail deleted successfully" });
  // });
});

// Image upload endpoint
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const filePath = "/uploads/" + req.file.filename;
  res.json({ filePath });
});

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err.message);
    } else {
      console.log("Database connection closed.");
    }
    process.exit(0);
  });
});
