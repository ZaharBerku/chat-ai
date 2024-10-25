import { ChangeEvent, useState, FC, useEffect, memo } from "react";
import { BsChatLeft } from "react-icons/bs";
import { Tooltip } from "flowbite-react";
import { History } from "@/types/Model";
import Actions from "./Actions";

interface ConversationProps {
  data: History;
  handleClickItem: (data: History) => void;
  handleClickSaveName: (name: string, id: number) => void;
  handleClickDelete: (id: number, threadId: string) => void;
  handleClickStarred: (id: number) => void;
  isSelectConversation?: boolean;
}

const Conversation: FC<ConversationProps> = ({
  data,
  isSelectConversation,
  handleClickItem,
  handleClickSaveName,
  handleClickDelete,
  handleClickStarred,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const title = data.name;
  const [value, setValue] = useState(title);

  const handleOpenEdit = () => {
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
  };

  const handleDone = () => {
    handleClickSaveName(value, data.id);
    handleCloseEdit();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setValue(value);
  };

  useEffect(() => {
    setValue(title);
  }, [title]);
  return (
    <li
      onClick={() => handleClickItem(data)}
      className={`list-none flex justify-between py-2 px-2 items-center gap-2 relative rounded-md hover:bg-[#2A2B32] cursor-pointer break-all group ${
        isSelectConversation ? "bg-[#2A2B32]" : ""
      }`}
    >
      <BsChatLeft />

      {isEditing ? (
        <div className="flex-1">
          <input
            disabled={!isEditing}
            onChange={handleChange}
            onClick={(e) => e.stopPropagation()}
            value={value}
            className={`whitespace-nowrap overflow-hidden text-ellipsis w-full bg-transparent outline-none ${
              isEditing ? "pointer-events-auto" : "pointer-events-none"
            }`}
          />
        </div>
      ) : (
        <p className="flex-1 w-full overflow-hidden">
          <span className="block w-full whitespace-nowrap overflow-hidden text-ellipsis bg-transparent outline-none max-h-5 no-scrollbar scroll-on-hover hover:overflow-visible">
            {value}
          </span>
        </p>
      )}

      <Actions
        isEditing={isEditing}
        handleCloseEdit={handleCloseEdit}
        handleOpenEdit={handleOpenEdit}
        data={data}
        value={value}
        handleDone={handleDone}
        handleClickDelete={handleClickDelete}
        handleClickStarred={handleClickStarred}
      />
    </li>
  );
};

export default Conversation;
