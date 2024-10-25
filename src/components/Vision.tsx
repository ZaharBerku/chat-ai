import { FC, ChangeEvent, MouseEvent } from "react";
import { BsPaperclip } from "react-icons/bs";

interface VisionProps {
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  setFocusTextarea: () => void;
}

const Vision: FC<VisionProps> = ({ handleChange, setFocusTextarea }) => {
  const handleChangeFile = (event: ChangeEvent<HTMLInputElement>) => {
    handleChange(event);
    setFocusTextarea();
  };
  const handleClick = (event: MouseEvent<HTMLInputElement>) => {
    if (event.target) {
      //@ts-ignore
      event.target.value = ''; // Reset the file input
    }
};
  return (
    <label className="cursor-pointer flex items-center w-6">
      <BsPaperclip size={24} />
      <input
        // accept=".png, .jpg, .jpeg, .webp"
        onChange={handleChangeFile}
        onClick={handleClick}
        type="file"
        multiple
        className="w-0 h-0 hidden"
      />
    </label>
  );
};

export default Vision;
