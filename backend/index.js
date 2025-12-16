const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { router: authRouter, verifyToken } = require("./routes/auth");
const fileRouter = require("./routes/files");

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://tugascloudcomputing.z23.web.core.windows.net'
  ],
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.json({
        message: "Backend Tugas Akhir Cloud Computing",
        endpoints: {
            auth: "/api/auth (register, login)",
            files: "/api/files (upload, list)"
        }
    });
});

app.use("/api/auth", authRouter);
app.use("/api/files", verifyToken, fileRouter);

app.listen(PORT, () => {
    console.log(`Backend berjalan di http://localhost:${PORT}`);
});

