const express = require("express");
const multer = require("multer");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = 3000;
const url = "mongodb://localhost:27017"; // OR can use env file and store there
const dbName = "eventsDB";

app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

const client = new MongoClient(url);

let db;

client
  .connect()
  .then(() => {
    db = client.db(dbName);
    console.log(`Connected to MongoDB at ${url}`);
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

// 1. GET /events?id=:event_id
app.get("/api/v3/app/events", async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Event ID is required" });
  }

  try {
    const event = await db
      .collection("events")
      .findOne({ _id: new ObjectId(id) });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch event", details: err.message });
  }
});

// 2. GET /events?type=latest&limit=5&page=1
app.get("/api/v3/app/events", async (req, res) => {
  const { type, limit = 5, page = 1 } = req.query;

  if (type !== "latest") {
    return res.status(400).json({ error: "Unsupported type" });
  }

  const skip = (page - 1) * limit;

  try {
    const events = await db
      .collection("events")
      .find()
      .sort({ schedule: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    res.json(events);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch events", details: err.message });
  }
});

// 3. POST /events
app.post(
  "/api/v3/app/events",
  upload.single("files[image]"),
  async (req, res) => {
    const {
      name,
      tagline,
      schedule,
      description,
      moderator,
      category,
      sub_category,
      rigor_rank,
    } = req.body;

    if (
      !name ||
      !tagline ||
      !schedule ||
      !description ||
      !moderator ||
      !category ||
      !sub_category ||
      !rigor_rank
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const event = {
      type: "event",
      name,
      tagline,
      schedule: new Date(schedule),
      description,
      files: req.file ? { image: req.file.path } : null,
      moderator,
      category,
      sub_category,
      rigor_rank: parseInt(rigor_rank),
      attendees: [],
    };

    try {
      const result = await db.collection("events").insertOne(event);
      res.json({ event_id: result.insertedId });
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to create event", details: err.message });
    }
  }
);

// 4. PUT /events/:id
app.put(
  "/api/v3/app/events/:id",
  upload.single("files[image]"),
  async (req, res) => {
    const { id } = req.params;
    const {
      name,
      tagline,
      schedule,
      description,
      moderator,
      category,
      sub_category,
      rigor_rank,
    } = req.body;

    const update = {
      $set: {
        ...(name && { name }),
        ...(tagline && { tagline }),
        ...(schedule && { schedule: new Date(schedule) }),
        ...(description && { description }),
        ...(req.file && { files: { image: req.file.path } }),
        ...(moderator && { moderator }),
        ...(category && { category }),
        ...(sub_category && { sub_category }),
        ...(rigor_rank && { rigor_rank: parseInt(rigor_rank) }),
      },
    };

    try {
      const result = await db
        .collection("events")
        .updateOne({ _id: new ObjectId(id) }, update);

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.json({ message: "Event updated successfully" });
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to update event", details: err.message });
    }
  }
);

// 5. DELETE /events/:id
app.delete("/api/v3/app/events/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db
      .collection("events")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete event", details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
