import * as React from "react";
import * as ReactDOM from "react-dom";

type State = {
  videoSrc: string;
  audioSrc: string;
  downloadLink: string;
};

const Application = () => {
  const [state, setState] = React.useState<State>({
    videoSrc: "",
    audioSrc: "",
    downloadLink: ""
  });
  const videoRef = React.createRef<HTMLVideoElement>();
  const audioRef = React.createRef<HTMLAudioElement>();
  return (
    <>
      <input
        type="file"
        multiple
        onChange={e => {
          if (e.target && e.target.files) {
            const file = e.target.files[0];
            console.log(file);
            var fileURL = URL.createObjectURL(file);
            setState({
              ...state,
              videoSrc: fileURL,
              audioSrc: fileURL
            });
          }
        }}
      />
      <video
        ref={videoRef}
        src={state.videoSrc}
        onEnded={() => {
          console.log("onended");
        }}
      ></video>
      <audio ref={audioRef} src={state.audioSrc}></audio>
      <button
        type="button"
        onClick={() => {
          videoRef.current?.play();
          audioRef.current?.play();
        }}
      >
        Start recording
      </button>
      <canvas ref="canvas"></canvas>
      <a href={state.downloadLink}>download</a>
    </>
  );
};
ReactDOM.render(<Application />, document.getElementById("app"));
