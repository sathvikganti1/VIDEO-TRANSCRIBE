
const videoInput = document.getElementById("videoInput");
const dropZone = document.getElementById("dropZone");
const videoArea = document.getElementById("videoArea");
const videoPlayer = document.getElementById("videoPlayer");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const transcribeBtn = document.getElementById("transcribeBtn");
const changeVideo = document.getElementById("changeVideo");
const statusMessage = document.getElementById("statusMessage");
const transcriptEmpty = document.getElementById("transcriptEmpty");
const transcriptList = document.getElementById("transcriptList");
const segmentCount = document.getElementById("segmentCount");
const exportTxt = document.getElementById("exportTxt");
const exportSrt = document.getElementById("exportSrt");

const allowedExtensions = /\.(mp4|webm|mov|avi|mkv)$/i;

let selectedFile = null;
let videoUrl = null;
let segments = [];
let isProcessing = false;

function setStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = "status-message";

  if (type) {
    statusMessage.classList.add(type);
  }
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  return [hours, minutes, secs]
    .map(value => String(value).padStart(2, "0"))
    .join(":");
}

function srtTimeToSeconds(time) {
  const match = time.trim().match(
    /^(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/
  );

  if (!match) return 0;

  return (
    Number(match[1]) * 3600 +
    Number(match[2]) * 60 +
    Number(match[3]) +
    Number(match[4]) / 1000
  );
}

function secondsToSrtTime(seconds) {
  const milliseconds = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  const secs = Math.floor((milliseconds % 60000) / 1000);
  const ms = milliseconds % 1000;

  return (
    `${String(hours).padStart(2, "0")}:` +
    `${String(minutes).padStart(2, "0")}:` +
    `${String(secs).padStart(2, "0")},` +
    `${String(ms).padStart(3, "0")}`
  );
}

function parseSrt(srt) {
  const blocks = srt.trim().split(/\r?\n\s*\r?\n/);

  return blocks
    .map(block => {
      const lines = block.split(/\r?\n/);
      const timeLineIndex = lines.findIndex(line => line.includes("-->"));

      if (timeLineIndex === -1) return null;

      const times = lines[timeLineIndex].split("-->");

      if (times.length !== 2) return null;

      return {
        start: srtTimeToSeconds(times[0]),
        end: srtTimeToSeconds(times[1]),
        text: lines.slice(timeLineIndex + 1).join("\n").trim()
      };
    })
    .filter(segment => segment && segment.text);
}

function updateExportButtons() {
  const hasSegments = segments.length > 0;

  exportTxt.disabled = !hasSegments;
  exportSrt.disabled = !hasSegments;
  segmentCount.textContent =
    `${segments.length} segment${segments.length === 1 ? "" : "s"}`;
}

function renderTranscript() {
  transcriptList.replaceChildren();

  const hasSegments = segments.length > 0;

  transcriptEmpty.classList.toggle("hidden", hasSegments);
  transcriptList.classList.toggle("hidden", !hasSegments);

  segments.forEach((segment, index) => {
    const row = document.createElement("div");
    row.className = "transcript-segment";

    const timestamp = document.createElement("button");
    timestamp.className = "timestamp";
    timestamp.type = "button";
    timestamp.textContent = formatTime(segment.start);
    timestamp.title = "Jump to this moment in the video";

    timestamp.addEventListener("click", () => {
      videoPlayer.currentTime = segment.start;
      videoPlayer.play().catch(() => {
        // The browser may require a manual click to start playback.
      });
    });

    const textarea = document.createElement("textarea");
    textarea.className = "segment-text";
    textarea.value = segment.text;
    textarea.rows = Math.max(2, Math.min(5, segment.text.split("\n").length + 1));
    textarea.setAttribute("aria-label", `Transcript segment ${index + 1}`);
    textarea.spellcheck = true;

    textarea.addEventListener("input", () => {
      segments[index].text = textarea.value;
    });

    row.append(timestamp, textarea);
    transcriptList.appendChild(row);
  });

  updateExportButtons();
}

function resetTranscript() {
  segments = [];
  renderTranscript();
}

function chooseVideo(file) {
  if (!file) return;

  if (!allowedExtensions.test(file.name)) {
    setStatus("Choose a supported video: MP4, WebM, MOV, AVI or MKV.", "error");
    return;
  }

  if (file.size > 200 * 1024 * 1024) {
    setStatus("This video is larger than the 200 MB limit.", "error");
    return;
  }

  if (file.size === 0) {
    setStatus("This video file is empty.", "error");
    return;
  }

  selectedFile = file;
  resetTranscript();

  if (videoUrl) {
    URL.revokeObjectURL(videoUrl);
  }

  videoUrl = URL.createObjectURL(file);
  videoPlayer.src = videoUrl;

  fileName.textContent = file.name;
  fileSize.textContent = formatSize(file.size);

  dropZone.classList.add("hidden");
  videoArea.classList.remove("hidden");

  transcribeBtn.disabled = false;
  setStatus("Video ready. Select Transcribe video to begin.", "success");
}

videoInput.addEventListener("change", event => {
  chooseVideo(event.target.files[0]);
});

changeVideo.addEventListener("click", () => {
  if (!isProcessing) {
    videoInput.click();
  }
});

dropZone.addEventListener("dragover", event => {
  event.preventDefault();
  dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", event => {
  event.preventDefault();
  dropZone.classList.remove("drag-over");

  if (!isProcessing) {
    chooseVideo(event.dataTransfer.files[0]);
  }
});

transcribeBtn.addEventListener("click", async () => {
  if (!selectedFile || isProcessing) return;

  isProcessing = true;
  transcribeBtn.disabled = true;
  videoInput.disabled = true;
  changeVideo.disabled = true;
  transcribeBtn.textContent = "Transcribing locally...";
  setStatus("Preparing audio and running Whisper. Longer videos may take a while.");

  const formData = new FormData();
  formData.append("video", selectedFile);

  try {
    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.details || result.error || "Transcription failed.");
    }

    segments = parseSrt(result.transcript || "");
    renderTranscript();

    if (segments.length === 0) {
      setStatus(
        "Whisper finished, but no transcript segments were returned. Check whether the video contains clear speech.",
        "error"
      );
    } else {
      setStatus(
        `Transcription complete. ${segments.length} segments are ready to review.`,
        "success"
      );
    }
  } catch (error) {
    console.error(error);
    setStatus(
      `Could not transcribe: ${error.message}. Check that the local server is running and try again.`,
      "error"
    );
  } finally {
    isProcessing = false;
    transcribeBtn.disabled = !selectedFile;
    videoInput.disabled = false;
    changeVideo.disabled = false;
    transcribeBtn.innerHTML = "<span>✦</span> Transcribe video";
  }
});

function downloadFile(contents, filename, mimeType) {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getSafeBaseName() {
  const name = selectedFile?.name || "transcript";
  return name.replace(/\.[^.]+$/, "").replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
}

exportTxt.addEventListener("click", () => {
  if (!segments.length) return;

  const text = segments
    .map(segment => `[${formatTime(segment.start)}] ${segment.text}`)
    .join("\n\n");

  downloadFile(
    text,
    `${getSafeBaseName()}-transcript.txt`,
    "text/plain;charset=utf-8"
  );
});

exportSrt.addEventListener("click", () => {
  if (!segments.length) return;

  const srt = segments
    .map((segment, index) => {
      return (
        `${index + 1}\n` +
        `${secondsToSrtTime(segment.start)} --> ${secondsToSrtTime(segment.end)}\n` +
        `${segment.text}`
      );
    })
    .join("\n\n");

  downloadFile(
    srt,
    `${getSafeBaseName()}-transcript.srt`,
    "application/x-subrip;charset=utf-8"
  );
});

window.addEventListener("beforeunload", () => {
  if (videoUrl) URL.revokeObjectURL(videoUrl);
});

renderTranscript();