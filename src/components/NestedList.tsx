import { FC, memo } from "react";
import { History } from "@/types/Model";
import Conversation from "./Conversation";

interface NestedListProps {
  history: History[];
  selectId?: number | null;
  title: string;
  handleClickItem: (data: History) => void;
  handleClickSaveName: (name: string, id: number) => void;
  handleClickDelete: (id: number, threadId: string) => void;
  handleClickStarred: (id: number) => void;
}

const NestedList: FC<NestedListProps> = ({
  history,
  selectId,
  title,
  handleClickItem,
  handleClickSaveName,
  handleClickDelete,
  handleClickStarred,
}) => {
  if (!history?.length) {
    return null;
  }
  return (
    <ul>
      <li className={"font-semibold"}>{title}</li>
      {history.map((data: History) => {
        return (
          <Conversation
            key={data.id}
            data={data}
            isSelectConversation={selectId === data.id}
            handleClickItem={handleClickItem}
            handleClickSaveName={handleClickSaveName}
            handleClickDelete={handleClickDelete}
            handleClickStarred={handleClickStarred}
          />
        );
      })}
    </ul>
  );
};

export default NestedList;
