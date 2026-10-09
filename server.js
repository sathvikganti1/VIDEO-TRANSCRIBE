
const express = require("express");
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

const ROOT = __dirname;
const UPLOAD_DIR = path.join(ROOT, "uploads");

const WHISPER = path.join(
  ROOT,
  "..",
  "whisper.cpp",
  "build",
  "bin",
  "Release",
  "whisper-cli.exe"
);

const MODEL = path.join(
  ROOT,
  "..",
  "whisper.cpp",
  "models",
  "ggml-tiny.en.bin"
);

const FFMPEG =
  "C:\\Users\\DURGA RAO KARINKI\\Downloads\\ffmpeg-9.0.2-essentials_build\\ffmpeg-9.0.2-essentials_build\\bin\\ffmpeg.exe";

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(express.static(path.join(ROOT, "public")));
app.use(express.json());

const upload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowed = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska"
    ];

    cb(
      allowed.includes(file.mimetype)
        ? null
        : new Error("Please select an MP4, WebM, MOV, AVI, or MKV video."),
      allowed.includes(file.mimetype)
    );
  }
});

function runProcess(executable, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { windowsHide: true });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", chunk => stdout += chunk);
    child.stderr.on("data", chunk => stderr += chunk);
    child.on("error", reject);

    child.on("close", code => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(stderr || `Process exited with code ${code}`));
    });
  });
}

app.post("/api/transcribe", upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Choose a video first." });
  }

  const input = req.file.path;
  const audio = `${input}.wav`;
  const outputBase = `${input}-transcript`;

  try {
    if (!fs.existsSync(WHISPER)) {
      throw new Error("Whisper executable was not found. Check its path.");
    }

    if (!fs.existsSync(MODEL)) {
      throw new Error("Whisper model was not found. Check its path.");
    }

    // Convert video audio to mono, 16 kHz WAV for Whisper.
    await runProcess(FFMPEG, [
      "-y",
      "-i", input,
      "-vn",
      "-ac", "1",
      "-ar", "16000",
      "-c:a", "pcm_s16le",
      audio
    ]);

    // Ask Whisper to generate an SRT subtitle file with timestamps.
    await runProcess(WHISPER, [
      "-m", MODEL,
      "-f", audio,
      "-osrt",
      "-of", outputBase
    ]);

    const srtPath = `${outputBase}.srt`;
    const transcript = fs.readFileSync(srtPath, "utf8");

    res.json({ transcript });

  } catch (error) {
    console.error("Transcription failed:", error.message);
    res.status(500).json({
      error: "Transcription failed.",
      details: error.message
    });
  } finally {
    for (const file of [input, audio, `${outputBase}.srt`]) {
      try {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      } catch (error) {
        console.error("Temporary-file cleanup failed:", error.message);
      }
    }
  }
});

app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message || "Request failed." });
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Video Reviewer running at http://127.0.0.1:${PORT}`);
});