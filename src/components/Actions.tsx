import { FC } from "react";
import { MdOutlineDone, MdOutlineClose, MdDeleteOutline } from "react-icons/md";
import { TiEdit } from "react-icons/ti";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Dropdown } from "flowbite-react";
import { AiOutlineStar, AiFillStar } from "react-icons/ai";
import { History } from "@/types/Model";
import ActionButton from "./ActionButton";

interface ActionsProps {
  handleCloseEdit: () => void;
  isEditing: boolean;
  handleOpenEdit: () => void;
  data: History;
  handleDone: () => void;
  handleClickDelete: (id: number, threadId: string) => void;
  handleClickStarred: (id: number) => void;
  value?: string;
}

const Actions: FC<ActionsProps> = ({
  handleCloseEdit,
  isEditing,
  handleOpenEdit,
  data,
  value,
  handleDone,
  handleClickDelete,
  handleClickStarred,
}) => {
  return (
    <div onClick={(e) => e.stopPropagation()} className="flex">
      {isEditing ? (
        <>
          <ActionButton icon={MdOutlineDone} onClick={handleDone} />
          <ActionButton icon={MdOutlineClose} onClick={handleCloseEdit} />
        </>
      ) : (
        <>
          <ActionButton
            icon={data.starred ? AiFillStar : AiOutlineStar}
            onClick={() => handleClickStarred(data.id)}
          />
          <Dropdown
            label={<BsThreeDotsVertical size={20} />}
            inline
            arrowIcon={false}
          >
            <Dropdown.Item
              icon={() => <TiEdit size={20} />}
              onClick={handleOpenEdit}
            >
              Edit
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() =>
                handleClickDelete(data.id, data.ThreadId as string)
              }
              icon={() => <MdDeleteOutline size={20} />}
            >
              Delete
            </Dropdown.Item>
          </Dropdown>
        </>
      )}
    </div>
  );
};

export default Actions;
