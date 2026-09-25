import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import dotenv from "dotenv";
dotenv.config();

import { clerkMiddleware } from '@clerk/express';
import { connectDB } from './config/db.js';
import doctorRouter from './routes/doctorRouter.js';
import serviceRouter from './routes/serviceRouter.js';
import appointmentRouter from './routes/appointmentRouter.js';
import serviceAppointmentRouter from './routes/serviceAppointmentRouter.js';

const app = express();
const port = 4000;

const allowedOrigins=[ 
  "http://localhost:5173",
  "http://localhost:5174",
]

// Middleware
app.use(cors(
  {
    origin: function (origin, callback){
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)){
        return callback(null, true)
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET","POST","PUT","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization"]
  }
));
app.use(clerkMiddleware());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Routes
app.use("/api/doctors", doctorRouter);
app.use("/api/services", serviceRouter);
app.use("/api/appointments",appointmentRouter);
app.use("/api/service-appointments",serviceAppointmentRouter);

app.get('/', (req, res) => {
  res.send("API Working");
});

// ✅ Start server AFTER DB connects
const startServer = async () => {
  try {
    await connectDB();  // wait for DB

    console.log("DB Connected");

    app.listen(port, () => {
      console.log(`Server started on http://localhost:${port}`);
    });

  } catch (error) {
    console.error("DB connection failed:", error);
    process.exit(1);
  }
};

startServer();