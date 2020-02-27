import * as React from "react";
import * as ReactDOM from "react-dom";

import FFmpeg from "@ffmpeg/ffmpeg";

type State = {
  videoSrc: string;
  audioSrc: string;
  downloadLink: string;
  message: string;
};

const Application = () => {
  const [state, setState] = React.useState<State>({
    videoSrc: "",
    audioSrc: "",
    downloadLink: "",
    message: ""
  });

  const setMessage = (msg: string) => {
    setState({ ...state, message: msg });
    console.log(msg);
  };

  const { createWorker } = FFmpeg;
  const worker = createWorker({
    progress: ({ ratio }: { ratio: number }) => {
      setMessage(`Complete ratio: ${ratio}`);
    },
    logger: (data: any) => console.log("logger", data)
  });

  const concat = async ({
    target: { files }
  }: React.ChangeEvent<HTMLInputElement>) => {
    if (!files) {
      return;
    }
    setMessage("Loading ffmpeg-core.js");
    await worker.load();

    const names = [];
    for (const f of Array.from(files)) {
      const { name } = f;
      await worker.write(name, f);
      if (name.indexOf(".mp4") < 0) {
        const nameMp4 = name.split(".")[0] + ".mp4";
        await worker.transcode(name, nameMp4);
        // await worker.trim(nameMp4, nameMp4, "00:02:000", "00:3:500");
        names.push(nameMp4);
      } else {
        names.push(name);
      }
    }

    setMessage("Start concating: " + names);
    // nameにスペースが入っているとエラーになった
    await worker.concatDemuxer(names, "output.mp4");

    setMessage("Complete concating");
    const { data } = await worker.read("output.mp4");

    console.log("data", data);

    setState({
      ...state,
      videoSrc: URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      )
    });
  };

  return (
    <>
      <input
        type="file"
        multiple
        onChange={e => {
          concat(e);
        }}
      />
      <video src={state.videoSrc} controls></video>
      <input
        type="number"
        step="00.001"
        onChange={e => {
          console.log(e);
        }}
      ></input>
      <p>{state.message}</p>
    </>
  );
};
ReactDOM.render(<Application />, document.getElementById("app"));
