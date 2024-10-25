import { FC, Dispatch, SetStateAction } from "react";
import { getSortedHistory } from "@/utils/getSortedHistory";
import { History } from "@/types/Model";
import NestedList from "./NestedList";

interface ListChatProps {
  history: History[];
  setCurrentChat: Dispatch<SetStateAction<History | null>>;
  deleteChat: (id: number) => void;
  selectId?: number | null;
  editName: (name: string, id: number) => void;
  toggleStarred: (id: number) => void;
  toggleComponentVisibility?: () => void;
}

const ListChat: FC<ListChatProps> = ({
  history,
  setCurrentChat,
  deleteChat,
  selectId,
  editName,
  toggleStarred,
  toggleComponentVisibility,
}) => {
  const { currentHistory, starredHistory } = getSortedHistory(history);
  const handleClickItem = (data: History) => {
    setCurrentChat(data);
    if (toggleComponentVisibility) {
      toggleComponentVisibility();
    }
  };
  const handleClickSaveName = (name: string, id: number) => {
    editName(name, id);
  };
  const handleClickDelete = async (id: number, threadId: string) => {
    try {
      deleteChat(id);
      if (threadId) {
        await fetch(`/api/deleteThread?threadId=${threadId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleClickStarred = (id: number) => {
    toggleStarred(id);
  };

  return (
    <ul className="h-full overflow-y-auto">
      <NestedList
        history={starredHistory}
        selectId={selectId}
        title={"Starred"}
        handleClickItem={handleClickItem}
        handleClickSaveName={handleClickSaveName}
        handleClickDelete={handleClickDelete}
        handleClickStarred={handleClickStarred}
      />
      <NestedList
        history={currentHistory}
        selectId={selectId}
        title={"History"}
        handleClickItem={handleClickItem}
        handleClickSaveName={handleClickSaveName}
        handleClickDelete={handleClickDelete}
        handleClickStarred={handleClickStarred}
      />
    </ul>
  );
};

export default ListChat;
