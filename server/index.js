require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/db');
require('./models/user');
require('./models/visit');
require('./models/pushSubscription');
const visitRoutes = require("./routes/visitRoutes");
const userRoutes = require("./routes/userRoutes");
const pushRoutes = require("./routes/pushRoutes");
const jobRoutes = require("./routes/jobRoutes");
const { schedulePreArrivalNotifications } = require("./jobs/preArrivalNotificationJob");

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.FRONTEND_URL) {
  console.error("❌ FRONTEND_URL must be set: credentialed CORS requires an explicit origin");
  process.exit(1);
}

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

app.use("/api/visit", visitRoutes);
app.use("/api/user", userRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/jobs", jobRoutes);

sequelize.authenticate()
  .then(() => sequelize.sync())
  .then(() => {
    console.log("✅ Connected to PostgreSQL");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);

      if (process.env.NODE_ENV !== 'production') {
        schedulePreArrivalNotifications();
      }
    });
  })
  .catch(err => {
    console.error("❌ PostgreSQL connection error:", err);
    process.exit(1);
  });
