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

  const setMessage = (...args: any[]) => {
    console.log(args);
    setState({ ...state, message: args.map(a => a).toString() });
  };

  const { createWorker } = FFmpeg;
  const worker = createWorker({
    progress: (data: any) => {
      setMessage(`Complete ratio:`, data);
    },
    logger: (data: any) => console.log("logger", data)
  });

  const concat = async ({
    target: { files }
  }: React.ChangeEvent<HTMLInputElement>) => {
    if (!files) {
      return;
    }
    await worker.load();
    setMessage("Loading ffmpeg-core.js");

    const names = [];
    for (const f of Array.from(files)) {
      const { name } = f;
      await worker.write(name, f);
      if (name.indexOf(".mp4") < 0) {
        const nameMp4 = name.split(".")[0] + ".mp4";
        console.log("start transcode");
        await worker.transcode(name, nameMp4);
        console.log("start trim");
        const nameMp4Trimmed = name.split(".")[0] + "_trimmed" + ".mp4";
        await worker.trim(
          nameMp4,
          nameMp4Trimmed,
          "00:00:2.000",
          "00:00:4.000"
        );
        names.push(nameMp4Trimmed);
      } else {
        const nameMp4Trimmed = name.split(".")[0] + "_trimmed" + ".mp4";
        await worker.trim(name, nameMp4Trimmed, "00:00:2.000", "00:00:4.000");
        names.push(nameMp4Trimmed);
      }
    }

    setMessage("Start concating: ", names);
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
      <div>
        <input
          type="number"
          step="00.001"
          onChange={e => {
            console.log(e);
          }}
        ></input>
      </div>
      <p>{state.message}</p>
    </>
  );
};
ReactDOM.render(<Application />, document.getElementById("app"));
