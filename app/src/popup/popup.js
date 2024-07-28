const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");

// This extension requires a server running locally or at a datacenter to send data to an AWS S3 bucket for file storage.
const RELAY_SERVER_ADDRESS = "http://localhost:3000";
const ASSEMBLY_AI_API_KEY = "";

let mediaRecorder;
let audioChunks = [];

startBtn.addEventListener("click", () => {
  // Record the user's voice
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();

      mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        // Create new blob from the audio chunks to send to relay server
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.wav');

        fetch(`${RELAY_SERVER_ADDRESS}/upload`, {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          const publicURL = data.url;
          console.log('File uploaded successfully:', publicURL);
          
          // Feed public S3 link back to transcriber
          transcribe(publicURL);
        })
        .catch(error => {
          console.error('Error uploading file:', error);
        });

        audioChunks = [];
      };
    })
    .catch(error => {
      console.error("Error accessing microphone:", error);
    });
});

stopBtn.addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
});



// Send a download file link to AssemblyAI for transcription. Then send it back to the relay server for storage.
const transcribe = async (url) => {
  const apiURL = "https://api.assemblyai.com/v2/transcript";

  const transcribeResponse = await fetch(apiURL,
    {
      method: 'POST',
      headers: {
        'authorization': ASSEMBLY_AI_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        "audio_url": url
      })
    }
  );
  
  if (transcribeResponse.ok) {
    const transcriptionResponseJSON = await transcribeResponse.json();
    const transcriptionId = transcriptionResponseJSON.id;

    // Delay to give AssemblyAI time to transcribe the wav file before extracting its text
    setTimeout(async () => {
      const getTranscriptionResponse = await fetch(apiURL + `/${transcriptionId}`,
        {
          method: "GET",
          headers: {
            "authorization": ASSEMBLY_AI_API_KEY
          }
        }
      );
  
      const transcript = await getTranscriptionResponse.json();
  
      console.log(transcript.text);

      // Send the transcribed text back to your relay server for storage
      const formData = new FormData();
      formData.append("text", transcript.text);
      formData.append("fileName", `text-${transcriptionId}`);
      
      fetch(`${RELAY_SERVER_ADDRESS}/uploadTranscribed`,
        {
          method: "POST",
          body: formData
        }
      )
    }, 10000);

  } else {
    console.error(`${transcribeResponse.text}`);
  }

}