console.log('This is the background page.');
console.log('Put the background scripts here.');

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
});






// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "sendAudioToAPI") {
//     sendAudioToAPI(message.downloadURL);
//   }
// });

// const client = new AssemblyAI({
//   apiKey: '2f8d0db917864b68a43277d5db20990b' 
// })

// async function sendAudioToAPI(objectURL) {
//   // const formData = new FormData();
//   // formData.append('file', audioBlob, 'recording.wav');

//   const params = {
//     audio: objectURL,
//     speaker_labels: true
//   }

//   const transcript = await client.transcripts.transcribe(params);
//   console.log(transcript.text);

//   for (let utterance of transcript.utterances) {
//     console.log(`Speaker ${utterance.speaker}: ${utterance.text}`);
//   }
// }