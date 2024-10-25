import { useState } from "react";

const useNotification = (): {
  visible: boolean;
  text: string;
  showNotification: (text: string, isLoading: boolean) => void;
} => {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");

  const showNotification = (text: string, isLoading: boolean): void => {
    setVisible(isLoading);
    setText(text);
  };

  return {
    visible,
    text,
    showNotification,
  };
};
export default useNotification;
