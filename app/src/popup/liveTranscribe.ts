import { Readable } from 'stream'
import { AssemblyAI, RealtimeTranscriber, RealtimeTranscript } from 'assemblyai'
// import { SoxRecording } from './Sox/sox'

// Stop recording and close connection
export const stopLiveTranscribe = async (recording: any, transcriber: RealtimeTranscriber) => {
  process.on('SIGINT', async function () {
    console.log()
    console.log('Stopping recording')
    recording.stop()

    console.log('Closing real-time transcript connection')
    await transcriber.close()

    process.exit()
  })
}

export const startLiveTranscribe = async () => {
  // Create AssemblyAI client
  const client = new AssemblyAI({
    apiKey: '2f8d0db917864b68a43277d5db20990b' 
  })

  // Amount of audio samples per second in Hz. Higher sample rates = better transcription, but leads to more data used.
  // Quality can range from 8_000 -> 16_000 -> 48_000
  const SAMPLE_RATE = 16_000

  const transcriber = client.realtime.transcriber({
    sampleRate: SAMPLE_RATE
  })

  // AssemblyAI Transcriber event handlers
  transcriber.on('open', ({ sessionId }) => {
    console.log(`Session opened with ID: ${sessionId}`)
  })

  transcriber.on('error', (error: Error) => {
    console.error('Error:', error)
  })

  transcriber.on('close', (code: number, reason: string) =>
    console.log('Session closed:', code, reason)
  )

  // Transcription event handler
  transcriber.on('transcript', (transcript: RealtimeTranscript) => {
    if (!transcript.text) {
      return
    }

    if (transcript.message_type === 'PartialTranscript') {
      console.log('Partial:', transcript.text)
    } else {
      console.log('Final:', transcript.text)
    }
  })

  console.log('Connecting to real-time transcript service')
  await transcriber.connect()

  console.log('Starting recording')
  // const recording = new SoxRecording({
  //   channels: 1,
  //   sampleRate: SAMPLE_RATE,
  //   audioType: 'wav' // Linear PCM
  // })

  // recording.stream().pipeTo(transcriber.stream())
}