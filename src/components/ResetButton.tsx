import { FC } from "react";
import { BiRefresh } from "react-icons/bi";

interface ResetButtonProps {
  isError: boolean;
  textError: string;
  isOnline: boolean;
  handleRegenerate: (e: any) => void;
  isStreamingAnswer: boolean;
}

interface ErrorTextProps {
  text: string;
}

const ErrorText: FC<ErrorTextProps> = ({ text }) => {
  return <span className="text-white text-xs">{text}</span>;
};

const ResetButton: FC<ResetButtonProps> = ({
  isError,
  textError,
  isOnline,
  handleRegenerate,
  isStreamingAnswer,
}) => {
  if (!isError && isOnline) {
    return null;
  }

  const handleReloadPage = () => {
    location.reload();
  };

  const handleClick = isOnline ? handleRegenerate : handleReloadPage;

  return (
    <div className="flex flex-col gap-2 items-center justify-center w-full">
      {textError && <ErrorText text={textError} />}
      {!isOnline && <ErrorText text={"Check your internet connection"} />}
      <button
        type="button"
        disabled={isStreamingAnswer}
        className="text-white px-2 py-3 bg-blue-700 rounded-md flex items-center gap-1"
        onClick={handleClick}
      >
        <BiRefresh size={18} />
        {isOnline ? "Regenerate" : "Reload Page"}
      </button>
    </div>
  );
};

export default ResetButton;
