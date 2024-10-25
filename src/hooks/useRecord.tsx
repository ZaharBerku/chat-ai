import { useEffect, useState, useRef } from "react";
import { getBase64 } from "@/utils/getBase64";
const useRecord = () => {
  const [text, setText] = useState();
  const backgroundRecordButton = useRef<HTMLDivElement>(null);
  const isRecording = useRef<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null);
  const newMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  let chunks: any = [];

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
      track.enabled = false;
    });
    streamRef.current = null;
  };

  const startStream = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        const context = new AudioContext();
        const microphone = context.createMediaStreamSource(stream);
        const newMediaRecorder = new MediaRecorder(stream);
        streamRef.current = stream;
        newMediaRecorder.onstart = () => {
          const analyzer = context.createAnalyser();
          microphone.connect(analyzer);
          const array = new Uint8Array(analyzer.fftSize);
          function getPeakLevel() {
            analyzer.getByteTimeDomainData(array);
            return (
              array.reduce(
                (max, current) => Math.max(max, Math.abs(current - 127)),
                0
              ) / 128
            );
          }

          function tick() {
            const peak = getPeakLevel();
            if (isRecording.current) {
              changeSizeBackgroundRecordButton(peak + 0.5);
              requestAnimationFrame(tick);
            }
          }
          chunks = [];
          tick();
        };

        newMediaRecorder.ondataavailable = (e) => {
          chunks.push(e.data);
        };

        newMediaRecorder.onstop = async () => {
          changeSizeBackgroundRecordButton(0);
          const audioBlob = new Blob(chunks, { type: "audio/mp4" });
          getBase64(audioBlob, getSpeechToText);
        };
        newMediaRecorderRef.current = newMediaRecorder;
        newMediaRecorder.start(1000);
      });
  };

  const startRecording = () => {
    isRecording.current = true;
    setRecording(true);
    startStream();
  };

  const stopRecording = () => {
    isRecording.current = false;
    newMediaRecorderRef.current?.stop();
    stopStream();
    setRecording(false);
  };

  const getSpeechToText = async (base64data: string) => {
    try {
      const response = await fetch("/api/speechToText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio: base64data,
        }),
      }).then((res) => res.json());
      const { text } = response;
      setText(text);
    } catch (error) {
      console.log(error);
    }
  };

  const changeSizeBackgroundRecordButton = (size: number) => {
    const backgroundRecordButtonStyle = backgroundRecordButton.current?.style;
    if (
      backgroundRecordButtonStyle &&
      backgroundRecordButtonStyle.transform !== undefined
    ) {
      backgroundRecordButtonStyle.transform = `scale(${size})`;
    }
  };

  const checkPermissionForStream = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        streamRef.current = stream;
        stopStream();
      });
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      checkPermissionForStream();
    }
  }, []);

  return {
    startRecording,
    stopRecording,
    text,
    recording,
    backgroundRecordButton,
    setText,
  } as const;
};

export default useRecord;
