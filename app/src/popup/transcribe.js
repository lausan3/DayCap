import { AssemblyAI } from 'assemblyai';
// import secrets from 'secrets';

const client = new AssemblyAI({
  apiKey: "2f8d0db917864b68a43277d5db20990b"
})


export const transcribe = async (url) => {
  const config = {
    audio_url: url
  }

  const transcript = await client.transcripts.transcribe(config)
  console.log(transcript.text)

  for (let utterance of transcript.utterances) {
    console.log(`Speaker ${utterance.speaker}: ${utterance.text}`);
  }
}