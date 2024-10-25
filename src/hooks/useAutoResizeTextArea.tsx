import { useRef, useEffect } from "react";

function useAutoResizeTextArea(dependencies:any[] = [] ) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "0px";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [textAreaRef, ...dependencies]);

  return textAreaRef;
}

export default useAutoResizeTextArea;
