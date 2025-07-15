const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

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
app.get("/api/cocktails", (req, res) => {
  const query = "SELECT * FROM cocktails ORDER BY created_at DESC";
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single cocktail by ID
app.get("/api/cocktails/:id", (req, res) => {
  const query = "SELECT * FROM cocktails WHERE id = ?";
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: "Cocktail not found" });
      return;
    }
    res.json(row);
  });
});

// Create new cocktail
app.post("/api/cocktails", (req, res) => {
  const { theCock, theIngredients, theRecipe, theJpeg, theComment } = req.body;

  if (!theCock || !theIngredients || !theRecipe) {
    res
      .status(400)
      .json({ error: "Cocktail name, ingredients, and recipe are required" });
    return;
  }

  const query = `
    INSERT INTO cocktails (theCock, theIngredients, theRecipe, theJpeg, theComment)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [theCock, theIngredients, theRecipe, theJpeg, theComment],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        theCock,
        theIngredients,
        theRecipe,
        theJpeg,
        theComment,
      });
    }
  );
});

// Update cocktail
app.put("/api/cocktails/:id", (req, res) => {
  const { theCock, theIngredients, theRecipe, theJpeg, theComment } = req.body;

  if (!theCock || !theIngredients || !theRecipe) {
    res
      .status(400)
      .json({ error: "Cocktail name, ingredients, and recipe are required" });
    return;
  }

  const query = `
    UPDATE cocktails 
    SET theCock = ?, theIngredients = ?, theRecipe = ?, theJpeg = ?, theComment = ?
    WHERE id = ?
  `;

  db.run(
    query,
    [theCock, theIngredients, theRecipe, theJpeg, theComment, req.params.id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: "Cocktail not found" });
        return;
      }
      res.json({ message: "Cocktail updated successfully" });
    }
  );
});

// Delete cocktail
app.delete("/api/cocktails/:id", (req, res) => {
  const query = "DELETE FROM cocktails WHERE id = ?";
  db.run(query, [req.params.id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: "Cocktail not found" });
      return;
    }
    res.json({ message: "Cocktail deleted successfully" });
  });
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
