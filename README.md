# IntroReview --- Student Introduction Video Reviewer

A beginner-friendly, local-first website for transcribing student
introduction videos, reviewing the transcript, correcting mistakes, and
exporting the corrected text.

> **Project status:** This guide documents the current prototype
> described in the project setup. It provides video preview, local
> Whisper transcription, timestamped transcript editing, and TXT/SRT
> export when the corresponding files are configured correctly. It does
> **not** claim to provide automatic student grading, user accounts,
> cloud storage, or production-grade security.

------------------------------------------------------------------------

## Contents

1.  [What does this project do?](#1-what-does-this-project-do)
2.  [How the application works](#2-how-the-application-works)
3.  [Requirements](#3-requirements)
4.  [Software download links](#4-software-download-links)
5.  [Install the required software](#5-install-the-required-software)
6.  [Create the project folders](#6-create-the-project-folders)
7.  [Download and build whisper.cpp](#7-download-and-build-whispercpp)
8.  [Download a Whisper model](#8-download-a-whisper-model)
9.  [Install FFmpeg](#9-install-ffmpeg)
10. [Configure the website](#10-configure-the-website)
11. [Install website dependencies](#11-install-website-dependencies)
12. [Start the website](#12-start-the-website)
13. [Test the complete workflow](#13-test-the-complete-workflow)
14. [How to start the project next
    time](#14-how-to-start-the-project-next-time)
15. [Troubleshooting](#15-troubleshooting)
16. [Privacy, limitations, and responsible
    use](#16-privacy-limitations-and-responsible-use)
17. [First successful run checklist](#17-first-successful-run-checklist)

------------------------------------------------------------------------

## 1. What does this project do?

IntroReview is a website for working with student self-introduction
videos.

The intended first-version workflow is:

1.  Select a video file from your computer.
2.  Preview the selected video in the browser.
3.  Send the video to a local website server running on your own
    computer.
4.  Use FFmpeg to extract the audio from the video.
5.  Use whisper.cpp to recognize the spoken words.
6.  Display the generated transcript with timestamps.
7.  Correct words or sentences in the browser.
8.  Export the corrected transcript as a text (`.txt`) file or subtitle
    (`.srt`) file.

The application is designed to work without a paid speech-to-text API.
The first model configured for this project, `ggml-tiny.en.bin`,
recognizes **English only**.

### What does "local-first" mean?

The application is intended to process videos on the same computer where
the website is running. The web address `http://127.0.0.1:3000` refers
to that computer, not a public website.

Local processing avoids the need to upload the video to a third-party
transcription service. However, do not assume every component is
automatically secure: keep the project updated, use trusted downloads,
and do not expose the development server to the internet.

------------------------------------------------------------------------

## 2. How the application works

``` text
Video selected in browser
          |
          v
Local website (HTML, CSS, JavaScript)
          |
          v
Node.js + Express server
          |
          v
FFmpeg extracts mono, 16 kHz WAV audio
          |
          v
whisper.cpp + downloaded model
          |
          v
Timestamped SRT transcript
          |
          v
Browser transcript editor
          |
          v
Export corrected TXT or SRT
```

### Tools explained in simple language

  -----------------------------------------------------------------------
  Tool                                What it does
  ----------------------------------- -----------------------------------
  Visual Studio Code (VS Code)        The editor used to create and edit
                                      project files.

  Node.js                             Runs the JavaScript server outside
                                      the browser.

  npm                                 Installs JavaScript packages used
                                      by the website. It is installed
                                      with Node.js.

  Express                             A Node.js library that handles
                                      website requests and the
                                      transcription endpoint.

  Multer                              A library that accepts the video
                                      file sent by the browser.

  FFmpeg                              Extracts audio from a video and
                                      converts it to a format suitable
                                      for speech recognition.

  whisper.cpp                         A C/C++ implementation of Whisper
                                      speech recognition that can run
                                      locally.

  Whisper model                       A downloaded set of model data used
                                      to recognize speech.

  C++ Build Tools                     Provides the compiler needed to
                                      build whisper.cpp on Windows.

  CMake                               Helps configure the native C/C++
                                      build.

  Git                                 Downloads and manages source code
                                      repositories.

  WAV                                 An audio file format. This project
                                      prepares mono, 16 kHz WAV audio for
                                      Whisper.

  SRT                                 A subtitle format containing
                                      numbered transcript segments with
                                      start and end timestamps.

  localhost / 127.0.0.1               An address that points back to the
                                      computer running the application.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 3. Requirements

This guide is written for a student using a new Windows laptop who has
installed only VS Code.

You will need:

-   Windows 10 or Windows 11, preferably 64-bit.
-   An internet connection for the initial software, source code, and
    model downloads.
-   Permission to install software. Some installers may request
    administrator approval.
-   Enough free disk space for the tools, source code, model, and build
    files. The required amount depends on the chosen build and model.
-   A short video containing clear spoken English for the first test.
-   Time for the initial native C++ build. The build may take several
    minutes or longer depending on the computer.

**Important:** There are two different terminals used in this guide:

-   **Developer Command Prompt:** used when compiling whisper.cpp with
    Microsoft's C++ compiler.
-   **VS Code PowerShell terminal:** used for most website commands.

Do not paste every command into the same terminal. Each step says where
to run it.

------------------------------------------------------------------------

## 4. Software download links

Use official project pages whenever possible.

  -----------------------------------------------------------------------------------------------------------------------
  Software                Download / documentation                                                Required?
  ----------------------- ----------------------------------------------------------------------- -----------------------
  Visual Studio Code      https://code.visualstudio.com/download                                  Yes, for editing

  Node.js LTS             https://nodejs.org/en/download                                          Yes

  Visual Studio C++ Build https://visualstudio.microsoft.com/visual-cpp-build-tools/              Yes, to compile
  Tools                                                                                           whisper.cpp with MSVC

  whisper.cpp             https://github.com/ggml-org/whisper.cpp                                 Yes

  FFmpeg Windows builds   https://www.gyan.dev/ffmpeg/builds/                                     Yes

  CMake                   https://cmake.org/download/                                             Yes if required by the
                                                                                                  selected whisper.cpp
                                                                                                  build instructions

  Git for Windows         https://git-scm.com/download/win                                        Recommended for cloning
                                                                                                  the repository

  Microsoft C++ setup     https://learn.microsoft.com/en-us/cpp/build/vscpp-step-0-installation   Helpful reference
  guide                                                                                           
  -----------------------------------------------------------------------------------------------------------------------

### Model downloads

Use the model instructions in the official whisper.cpp repository:

https://github.com/ggml-org/whisper.cpp

Do not download model files from random file-sharing websites. Model
names, download instructions, and repository locations can change, so
follow the current upstream instructions.

------------------------------------------------------------------------

## 5. Install the required software

### 5.1 Install VS Code

1.  Open https://code.visualstudio.com/download.
2.  Download the Windows installer suitable for your computer.
3.  Run the installer.
4.  Follow the installation wizard. If offered, options such as adding
    VS Code to PATH and adding "Open with Code" are convenient.
5.  Open VS Code once the installation finishes.

VS Code is the editor. It does not, by itself, install Node.js, FFmpeg,
or a C++ compiler.

### 5.2 Install Node.js LTS

1.  Open https://nodejs.org/en/download.
2.  Select the current **LTS** release for Windows.
3.  Download and run the Windows installer.
4.  Keep the normal default options unless your institution has a
    different setup policy.
5.  Finish the installation.
6.  Close and reopen VS Code so its terminal can find Node.js.

In VS Code, select **Terminal → New Terminal**. In the PowerShell
terminal, run:

``` powershell
node --version
npm.cmd --version
```

Both commands should print version numbers.

**Why use `npm.cmd`?** In some Windows PowerShell configurations,
running `npm` invokes a PowerShell script that is blocked by the
execution policy. `npm.cmd` calls the Windows command version instead.
Do not weaken your system's security settings just to work around this
issue.

### 5.3 Install Visual Studio C++ Build Tools

whisper.cpp contains native C/C++ code. To compile it with Microsoft's
compiler, install the C++ toolchain.

1.  Open https://visualstudio.microsoft.com/visual-cpp-build-tools/.
2.  Download and launch the Build Tools installer.
3.  In the workload list, select **Desktop development with C++**.
4.  Ensure the installer includes the MSVC C++ build tools and a Windows
    SDK. Keep the recommended components selected unless the current
    whisper.cpp instructions specify otherwise.
5.  Install the components and wait for the installer to finish.

To verify the compiler, open the Windows Start menu and search for **x64
Native Tools Command Prompt for Visual Studio** or the corresponding
**Developer Command Prompt** installed on your machine.

Open that prompt and run:

``` bat
cl
```

A successful setup displays Microsoft's C/C++ compiler information. It
may also say that no source file was supplied. That is fine: the purpose
of this check is to confirm that `cl` is available.

If Windows cannot find `cl`, you probably opened an ordinary terminal
instead of the Developer Command Prompt, or the C++ workload did not
install correctly.

### 5.4 Install CMake

1.  Open https://cmake.org/download/.
2.  Download the current Windows x64 installer.
3.  Run the installer.
4.  If the installer offers a PATH option, choose the option that makes
    CMake available from the command line for your user or all users,
    according to your permissions.
5.  Restart VS Code after installation.

In a new VS Code terminal, run:

``` powershell
cmake --version
```

You should see a version number.

Follow the current whisper.cpp build instructions if they specify a
different CMake setup.

### 5.5 Install Git for Windows

Git is recommended for downloading the whisper.cpp repository.

1.  Open https://git-scm.com/download/win.
2.  Download and run the Windows installer.
3.  Default installation options are generally suitable for beginners.
4.  Restart VS Code after installation.

Verify it in a new VS Code terminal:

``` powershell
git --version
```

You should see a Git version number.

------------------------------------------------------------------------

## 6. Create the project folders

The current server expects `whisper.cpp` and `video-reviewer` to be
sibling folders inside a parent folder named `videotranscribe`.

The layout should look like this:

``` text
videotranscribe/
├── whisper.cpp/
│   ├── build/
│   │   └── bin/
│   │       └── Release/
│   │           └── whisper-cli.exe
│   └── models/
│       └── ggml-tiny.en.bin
│
└── video-reviewer/
    ├── server.js
    ├── package.json
    ├── package-lock.json
    ├── node_modules/
    ├── uploads/
    └── public/
        ├── index.html
        ├── style.css
        └── app.js
```

Some build configurations may put `whisper-cli.exe` in a different
folder. If so, either follow the actual build output and update the
server configuration, or use a build configuration that produces the
expected location. **Always check where the executable was created
instead of assuming it exists.**

### Open the website project in VS Code

If the parent folder already exists on your Desktop, use VS Code's
**File → Open Folder** and select the `video-reviewer` folder inside
`videotranscribe`.

Alternatively, open a PowerShell terminal and run the following command,
changing the path if you placed the folder elsewhere:

``` powershell
cd "$HOME\Desktop\videotranscribe\video-reviewer"
code .
```

The command `cd` changes the current folder. The command `code .` opens
that folder in VS Code if the VS Code command-line launcher is
available.

If the folders do not exist yet, create the parent folder and project
folder in File Explorer or VS Code. Do not create a second nested
`video-reviewer\video-reviewer` folder accidentally.

------------------------------------------------------------------------

## 7. Download and build whisper.cpp

This section creates the local speech-recognition executable.

### 7.1 Download the repository

First, make sure Git is installed and that the parent `videotranscribe`
folder exists.

Open a normal PowerShell terminal and run:

``` powershell
cd "$HOME\Desktop\videotranscribe"
git clone https://github.com/ggml-org/whisper.cpp.git
```

If you already have a `whisper.cpp` folder containing the repository,
**do not clone it again into the same folder**. Instead, open that
existing folder and follow the current upstream update/build
instructions if needed.

Repository link: https://github.com/ggml-org/whisper.cpp

### 7.2 Read the current Windows build instructions

Open the official repository and its current README/build instructions:

https://github.com/ggml-org/whisper.cpp

Build commands and output paths can change between versions. Follow the
current upstream Windows/CMake instructions. The common CMake approach
is shown below, but use it only if it matches the checked-out version's
instructions.

Open the **x64 Native Tools Command Prompt for Visual Studio** and
change to the repository directory. For a typical Desktop setup:

``` bat
cd /d "%USERPROFILE%\Desktop\videotranscribe\whisper.cpp"
```

A common CMake build sequence is:

``` bat
cmake -B build
cmake --build build --config Release
```

If CMake cannot find a compiler, make sure you are using the Developer
Command Prompt and that the C++ workload and Windows SDK are installed.
If the upstream instructions have changed or require additional options,
follow those instructions rather than repeatedly running a command that
fails.

### 7.3 Find and verify the executable

After the build finishes, look for `whisper-cli.exe` inside the
repository's build output.

The current project configuration expects:

``` text
whisper.cpp\build\bin\Release\whisper-cli.exe
```

Check the file in File Explorer or run this in PowerShell, adjusting the
parent path if necessary:

``` powershell
Test-Path "$HOME\Desktop\videotranscribe\whisper.cpp\build\bin\Release\whisper-cli.exe"
```

If the command returns `True`, the file exists at that path. If it
returns `False`, search inside the `whisper.cpp\build` directory for
`whisper-cli.exe` and update the website configuration to use the actual
path.

You can test the executable by running its help command, using the real
path where it was built:

``` powershell
& "$HOME\Desktop\videotranscribe\whisper.cpp\build\bin\Release\whisper-cli.exe" --help
```

If PowerShell reports that the file does not exist, check the build
output location before continuing.

------------------------------------------------------------------------

## 8. Download a Whisper model

The executable is the speech-recognition program. The model file
contains the trained data it uses to recognize speech. You need both.

### 8.1 Choose the model

The current project expects:

``` text
whisper.cpp\models\ggml-tiny.en.bin
```

The `tiny.en` model is a relatively small **English-only** model. It can
be useful for an initial test, but it may make mistakes, especially with
names, accents, noisy audio, or unclear speech.

If students speak Telugu, Hindi, or other languages, an English-only
model is not suitable for those languages. Select an appropriate
multilingual model using the official project's model instructions.

### 8.2 Download the model using official instructions

1.  Open https://github.com/ggml-org/whisper.cpp.
2.  Read the current section on downloading models.
3.  Follow the repository's supported model-download method for
    `ggml-tiny.en.bin`, or choose a multilingual model if needed.
4.  Ensure the downloaded file is placed in the repository's `models`
    directory.
5.  Verify the expected file exists.

Example PowerShell check:

``` powershell
Test-Path "$HOME\Desktop\videotranscribe\whisper.cpp\models\ggml-tiny.en.bin"
```

A result of `True` means the expected file exists at that location. A
result of `False` means you need to locate or download the model and
then correct the path if necessary.

Do not rename a different model to `ggml-tiny.en.bin`. The filename must
match the actual model file, and the model type must be appropriate for
the selected language.

------------------------------------------------------------------------

## 9. Install FFmpeg

FFmpeg extracts audio from video files. The website uses it to convert
the audio into mono, 16 kHz WAV format before running Whisper.

### 9.1 Download a Windows build

1.  Open https://www.gyan.dev/ffmpeg/builds/.
2.  Select a current Windows essentials build suitable for your
    computer, using the instructions on the page.
3.  Download the archive and extract it with Windows File Explorer or an
    archive tool.
4.  Open the extracted folder.
5.  Find its `bin` folder. It should contain `ffmpeg.exe`.

The exact extracted folder name may vary with the release. Do not assume
the folder name will be identical to another laptop's folder.

### 9.2 Verify FFmpeg

You have two options.

**Option A: Run FFmpeg by its full path**

In PowerShell, type `&` followed by the quoted full path to `ffmpeg.exe`
and then `-version`. For example, if you extracted it to a folder under
Downloads:

``` powershell
& "C:\PATH\TO\ffmpeg\bin\ffmpeg.exe" -version
```

Replace `C:\PATH\TO\ffmpeg\bin\ffmpeg.exe` with the real path. The
example is a placeholder, not a literal path to copy.

**Option B: Add FFmpeg's `bin` folder to PATH**

1.  Copy the full path of the folder that contains `ffmpeg.exe`.
2.  Open Windows Start and search for **Edit environment variables for
    your account**.
3.  Select the `Path` user variable and choose **Edit**.
4.  Add a new entry containing the `bin` folder path.
5.  Save the dialogs and restart VS Code or open a new terminal.
6.  Run:

``` powershell
ffmpeg -version
```

If the command displays FFmpeg version information, Windows can find
FFmpeg through PATH.

Do not add the path to the `ffmpeg.exe` file itself. Add the **folder
containing it**.

### 9.3 Important application configuration note

The original prototype used a hard-coded FFmpeg path pointing to a
particular user's Downloads directory. That path will not work on a
different laptop.

Before sharing this project with other students, configure `server.js`
to use a portable setting. A good approach is to read the executable
location from an environment variable such as `FFMPEG_PATH`, with
`ffmpeg` as the command name when FFmpeg is available on PATH. The
server must be updated to implement that configuration; setting an
environment variable alone will not change code that still uses a
hard-coded path.

After making that change, document the chosen configuration in this
README and verify it with a short transcription test.

------------------------------------------------------------------------

## 10. Configure the website

The website folder should contain:

``` text
video-reviewer/
├── server.js
├── package.json
├── uploads/
└── public/
    ├── index.html
    ├── style.css
    └── app.js
```

### What the main files do

-   `server.js`: starts the local Express server, receives the video,
    calls FFmpeg and whisper.cpp, and returns the transcript.
-   `package.json`: records project metadata and JavaScript
    dependencies.
-   `public/index.html`: defines the visible page structure.
-   `public/style.css`: defines the website's appearance.
-   `public/app.js`: handles file selection, sending the video,
    displaying and editing transcript segments, and exporting TXT/SRT.
-   `uploads/`: holds temporary uploaded files while a transcription
    request is being processed.

The current server expects the Whisper executable and model at paths
relative to the website folder:

``` text
../whisper.cpp/build/bin/Release/whisper-cli.exe
../whisper.cpp/models/ggml-tiny.en.bin
```

These relative paths work only if the folder structure matches the
layout described earlier and the executable/model are actually present
at those locations.

### Check the FFmpeg setting

Open `server.js` in VS Code and search for `FFMPEG`.

If the code contains an absolute path to another person's Downloads
folder, replace that setup with a portable configuration before
distributing the project. Test the website after changing it.

### Check the file upload limit

The prototype accepts videos up to 200 MB. Larger files will be rejected
unless the server configuration and its resource limits are deliberately
changed.

------------------------------------------------------------------------

## 11. Install website dependencies

Open the `video-reviewer` folder in VS Code.

Open **Terminal → New Terminal**. The terminal should be in the folder
containing `server.js` and `package.json`.

Verify the current folder:

``` powershell
Get-Location
```

If necessary, navigate to it:

``` powershell
cd "$HOME\Desktop\videotranscribe\video-reviewer"
```

If `package.json` already lists the required dependencies, install them
with:

``` powershell
npm.cmd install
```

If the project is a fresh folder and the dependencies have not yet been
installed, use:

``` powershell
npm.cmd init -y
npm.cmd install express multer
```

Do not run `npm init -y` over an existing, correctly configured
`package.json` unless you know why you need to regenerate it.

Add the start script if it does not already exist:

``` powershell
npm.cmd pkg set scripts.start="node server.js"
```

This makes it possible to start the server with `npm.cmd start`.

If npm reports a package or network error, check the internet
connection, confirm that Node.js is installed, and read the error
message before trying a different installation command.

------------------------------------------------------------------------

## 12. Start the website

In the VS Code terminal, make sure the current folder is
`video-reviewer`.

Run:

``` powershell
npm.cmd start
```

When the server starts successfully, it should print a message similar
to:

``` text
Video Reviewer running at http://127.0.0.1:3000
```

Open a browser and visit:

**http://127.0.0.1:3000**

Keep the terminal open while using the application. Closing the terminal
stops the server.

If the page does not load:

1.  Check that the terminal still shows the running server.
2.  Look for errors printed in the terminal.
3.  Confirm that the URL uses port `3000`.
4.  Check whether another program is already using port `3000`.

------------------------------------------------------------------------

## 13. Test the complete workflow

For the first test, use a short video with clear English speech. This
helps separate setup problems from audio-quality problems.

1.  Open `http://127.0.0.1:3000`.
2.  Select a video file using the upload area.
3.  Confirm that the video preview appears.
4.  Click **Transcribe video**.
5.  Wait while the server extracts audio and runs whisper.cpp.
6.  Check that transcript segments appear with timestamps.
7.  Click a timestamp to seek to that point in the video.
8.  Edit a word or sentence in a transcript field.
9.  Select **Export TXT** and confirm that a text file is downloaded.
10. Select **Export SRT** and confirm that a subtitle file is
    downloaded.

### What to expect

The first transcription can take a while. Speed depends on the laptop,
video duration, audio quality, model, and available processing
resources. A local CPU-based run may take longer than the video itself.

A successful transcript is not guaranteed simply because the video
uploaded. FFmpeg, the Whisper executable, and the model must all be
correctly configured.

------------------------------------------------------------------------

## 14. How to start the project next time

Once the software has been installed and the project built, you normally
do not need to download everything again.

1.  Open VS Code.
2.  Open the `video-reviewer` project folder.
3.  Select **Terminal → New Terminal**.
4.  Run:

``` powershell
npm.cmd start
```

5.  Open http://127.0.0.1:3000 in your browser.
6.  Keep the terminal open while using the website.

If the server says a required file is missing, verify the Whisper
executable, model, and FFmpeg configuration before rebuilding or
reinstalling anything.

------------------------------------------------------------------------

## 15. Troubleshooting

### Problem: `node` is not recognized

**Cause:** Node.js is not installed, or the terminal has not refreshed
its PATH.

**Fix:**

1.  Install the LTS release from https://nodejs.org/en/download.
2.  Close and reopen VS Code.
3.  Run:

``` powershell
node --version
npm.cmd --version
```

### Problem: PowerShell says running `npm.ps1` is disabled

**Cause:** PowerShell is blocking the npm PowerShell script under the
current execution policy.

**Fix:** Use the Windows command version:

``` powershell
npm.cmd install
npm.cmd start
```

You generally do not need to change the machine's execution policy for
this project.

### Problem: `cl` is not recognized

**Cause:** The terminal may not be the Visual Studio Developer Command
Prompt, or the C++ compiler was not installed.

**Fix:**

1.  Open the Visual Studio Installer.
2.  Confirm that **Desktop development with C++** and the required
    MSVC/Windows SDK components are installed.
3.  Open the x64 Native Tools or Developer Command Prompt.
4.  Run `cl` again.

### Problem: CMake cannot configure or build whisper.cpp

**Cause:** Missing compiler components, an incorrect source directory, a
CMake problem, or a build instruction that does not match the current
repository version.

**Fix:**

1.  Open the official repository:
    https://github.com/ggml-org/whisper.cpp.
2.  Check the current Windows build instructions.
3.  Confirm that CMake and the C++ compiler are installed.
4.  Run the build commands from the correct repository folder and in the
    correct terminal.
5.  Read the first actual error in the build output. Later errors may
    only be consequences of the first one.

### Problem: `whisper-cli.exe` is missing

**Cause:** The build did not finish successfully, or the executable was
created in a different output folder.

**Fix:** Search inside `whisper.cpp\build` for `whisper-cli.exe`. If it
exists elsewhere, update the server configuration to match its real
location. If it does not exist, review the build output and rebuild
according to the upstream instructions.

### Problem: The Whisper model is missing

**Cause:** The model was not downloaded, was placed in the wrong folder,
or the server expects a different filename.

**Fix:** Follow the official model instructions at
https://github.com/ggml-org/whisper.cpp and verify that the model exists
at the configured path. Do not rename an unrelated model to make the
filename appear correct.

### Problem: FFmpeg is not found

**Cause:** FFmpeg is not installed, its `bin` folder is not on PATH, or
the server still contains a path from another computer.

**Fix:**

1.  Find the real `ffmpeg.exe` file.
2.  Test it with its full path.
3.  Either add its containing `bin` directory to PATH or configure the
    application with the correct executable path.
4.  Restart the terminal and server.
5.  Run `ffmpeg -version` if using PATH.

### Problem: The browser cannot connect to port 3000

**Cause:** The server is not running, crashed during startup, or another
program is using port 3000.

**Fix:**

1.  Check the VS Code terminal for errors.
2.  Stop an old instance of the project with `Ctrl+C` in its terminal,
    if applicable.
3.  Start it again using `npm.cmd start`.
4.  If port 3000 is occupied by another application, identify that
    application before changing ports. If you change the server port,
    the startup configuration must be updated consistently.

### Problem: The website says to choose a video even though a file was selected

**Possible causes:** The selected file's MIME type was rejected by the
upload filter, the file type is unsupported, or the browser did not
submit a valid video.

**Fix:**

1.  Try a standard MP4 video.
2.  Confirm the file is not empty and is smaller than 200 MB.
3.  Check the server terminal for errors.
4.  If a valid video is rejected, review the upload filter in
    `server.js`. Browser MIME types can vary by file and browser.

### Problem: The video exceeds 200 MB

The current prototype sets a 200 MB upload limit. Use a smaller test
video or intentionally adjust the limit in the server configuration.
Increasing the limit can require more memory, disk space, and processing
time; do not raise it without testing.

### Problem: The transcription is empty or inaccurate

**Possible causes:** No clear speech, low volume, background noise, a
language mismatch, or model limitations.

**Fix:**

1.  Test with a short video containing clear spoken English.
2.  Check that the video actually contains audible speech.
3.  Confirm that FFmpeg successfully extracted audio.
4.  Confirm that the model matches the spoken language.
5.  Review the transcript manually. Speech recognition can make mistakes
    with names, technical words, and accents.

### Problem: The transcription is very slow

Local processing speed depends on the computer and model. Try a shorter
test video, close resource-heavy applications, and verify that the model
is the one you intended to use. Do not assume that the program has
frozen just because it takes longer than the video's duration.

### Problem: The student speaks Telugu, Hindi, or another non-English language

The `ggml-tiny.en.bin` model is English-only. Choose a supported
multilingual Whisper model using the official whisper.cpp instructions
and update the server's model path accordingly. Then test the target
language with a clear sample.

### Problem: The page opens but transcription fails

The frontend can load even if transcription tools are misconfigured.
Check the server terminal and verify all three items:

-   The configured FFmpeg executable works.
-   The configured `whisper-cli.exe` exists and runs.
-   The configured model file exists and matches the expected model.

Fix the first error reported by the server, restart it, and test again.

------------------------------------------------------------------------

## 16. Privacy, limitations, and responsible use

### Privacy and temporary files

The prototype is designed for local processing. The server accepts a
video through a local endpoint, creates temporary audio and transcript
files, and attempts to delete those temporary files after the request
finishes. Temporary file cleanup can fail in some circumstances, so
check the `uploads` folder if troubleshooting an interrupted request.

The video preview uses a browser object URL for the selected local file.
Do not interpret this as a guarantee that every version of the
application has been independently security-audited.

### No cloud service or paid API

The intended transcription workflow uses a local FFmpeg executable,
local whisper.cpp executable, and a downloaded model. The initial setup
requires internet access to obtain software and model files, but
transcription itself does not need a paid transcription API.

### Current limitations

-   The configured `tiny.en` model is English-only.
-   Transcripts can contain mistakes and require human correction.
-   The application currently has a 200 MB upload limit.
-   Processing speed depends on the laptop.
-   The prototype does not automatically grade students unless a
    separate, tested review-scoring feature is implemented.
-   The current local development server should not be exposed publicly
    without proper security, authentication, upload validation, resource
    limits, and deployment changes.
-   TXT/SRT exports are downloaded to the user's browser. Do not assume
    corrected transcripts are automatically saved to a database.

### Responsible student review

If the application is used to review real student videos, tell students
how their videos will be processed, limit access to the files, and
follow your institution's rules for consent, retention, and evaluation.
Treat automatic transcription as an aid to human review, not as
unquestionable evidence of what a student said.

------------------------------------------------------------------------

## 17. First successful run checklist

Use this checklist when setting up a new laptop.

### Installations

-   [ ] VS Code opens successfully.
-   [ ] Node.js is installed.
-   [ ] `node --version` works.
-   [ ] `npm.cmd --version` works.
-   [ ] Visual Studio C++ Build Tools and a Windows SDK are installed.
-   [ ] `cl` works in the Developer Command Prompt.
-   [ ] CMake is installed if required by the current build
    instructions.
-   [ ] Git is installed if using `git clone`.
-   [ ] FFmpeg runs and its location is configured for the website.

### Whisper

-   [ ] The whisper.cpp repository is present.
-   [ ] The native build completes successfully.
-   [ ] `whisper-cli.exe` exists at the configured location.
-   [ ] The correct model file exists at the configured location.
-   [ ] The model language matches the intended test audio.

### Website

-   [ ] `server.js` exists.
-   [ ] `package.json` exists.
-   [ ] `public/index.html` exists.
-   [ ] `public/style.css` exists.
-   [ ] `public/app.js` exists.
-   [ ] `npm.cmd install` completes successfully.
-   [ ] `npm.cmd start` starts the server.
-   [ ] `http://127.0.0.1:3000` opens.
-   [ ] A short video previews correctly.
-   [ ] Transcription returns timestamped segments.
-   [ ] Transcript edits work.
-   [ ] TXT and SRT exports work.

------------------------------------------------------------------------

## Official references

-   **VS Code:** https://code.visualstudio.com/download
-   **Node.js:** https://nodejs.org/en/download
-   **Visual Studio C++ Build Tools:**
    https://visualstudio.microsoft.com/visual-cpp-build-tools/
-   **C++ installation guide:**
    https://learn.microsoft.com/en-us/cpp/build/vscpp-step-0-installation
-   **CMake:** https://cmake.org/download/
-   **Git for Windows:** https://git-scm.com/download/win
-   **FFmpeg Windows builds:** https://www.gyan.dev/ffmpeg/builds/
-   **whisper.cpp source, build, and model instructions:**
    https://github.com/ggml-org/whisper.cpp

**You're ready when the local website opens, a short English video can
be transcribed, and you can edit and export the transcript.** Start with
one short test video before trying a full collection of student
introductions.
