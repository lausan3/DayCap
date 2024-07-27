import React from 'react';
import './Popup.css';

import { startLiveTranscribe, stopLiveTranscribe } from "./liveTranscribe"

const Popup = () => {

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={() => console.log("started")}>Transcribe</button>
        <button onClick={() => console.log("stopped")}>Stop Transcribing</button>

        <p id="transcribed-text"></p>
      </header>
    </div>
  );
};

export default Popup;
