import { transcribe } from "./transcribe";

console.log("Loaded Popup/index.js");

const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");

let mediaRecorder;
let audioChunks = [];
let downloadURL = "";

startBtn.addEventListener("click", () => {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();

      mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        // Create new blob from the audio chunks to send to AssemblyAI
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const downloadURL = URL.createObjectURL(audioBlob);
        audioChunks = [];
        chrome.runtime.sendMessage({ action: "sendAudioToAPI", downloadURL });
      };
    })
    .catch(error => {
      if (error.name === 'NotAllowedError') {
        console.error("Permission to access the microphone was denied.");
      } else if (error.name === 'NotFoundError') {
        console.error("No microphone was found.");
      } else if (error.name === 'NotReadableError') {
        console.error("Microphone is already in use.");
      } else {
        console.error("Error accessing microphone:", error);
      }
    });
});

stopBtn.addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();

    console.log(`stop button clicked: ${downloadURL}`);

    if (downloadURL !== "") {
      transcribe(downloadURL);
    }
  }
});