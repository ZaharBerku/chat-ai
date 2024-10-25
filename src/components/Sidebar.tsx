import React, {
  FC,
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  useRef,
} from "react";
import { FiMessageSquare } from "react-icons/fi";
import { MdLogout, MdOutlineFeedback } from "react-icons/md";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { LiaUserEditSolid, LiaEye } from "react-icons/lia";
import { ToggleSwitch } from "flowbite-react";
import { Tooltip } from "flowbite-react";
import { History } from "@/types/Model";
import ListChat from "./ListChat";

interface SidebarProps {
  history: History[];
  setCurrentChat: Dispatch<SetStateAction<History | null>>;
  toggleComponentVisibility?: () => void;
  deleteChat: (id: number) => void;
  selectId?: number;
  editName: (name: string, id: number) => void;
  toggleStarred: (id: number) => void;
  handleOpenModal: () => void;
  togglePersonalize?: (value: boolean) => void;
  isMobile?: boolean;
  currentChat?: any;
}

interface PersonalizeSwitcherProps {
  currentChat: any;
  handleOpenModal: any;
  togglePersonalize: any;
  isMobile: any;
}

const PersonalizeSwitcher: FC<PersonalizeSwitcherProps> = ({
  currentChat,
  handleOpenModal,
  togglePersonalize,
  isMobile,
}) => {
  const isFirstMount = useRef(false);

  const [toggle, setToggle] = useState(
    Boolean(currentChat?.isEnabledPersonalize)
  );
  const handleChange = (checked: boolean) => {
    setToggle((currentToggle) => {
      return currentToggle;
    });
    setToggle(checked);
    if (checked) {
      handleOpenModal();
    }
  };
  useEffect(() => {
    if (currentChat?.id) {
      setToggle(currentChat?.isEnabledPersonalize);
    }
  }, [currentChat?.id]);

  useEffect(() => {
    if (togglePersonalize && currentChat && isFirstMount.current) {
      togglePersonalize(toggle);
    }
    isFirstMount.current = true;
  }, [toggle]);
  return (
    <div>
      {isMobile ? (
        <ToggleSwitch
          defaultChecked={toggle}
          checked={toggle}
          onChange={handleChange}
        />
      ) : (
        <Tooltip className="z-[100]" content={"Enable for new chats"}>
          <ToggleSwitch
            defaultChecked={toggle}
            checked={toggle}
            onChange={handleChange}
          />
        </Tooltip>
      )}
    </div>
  );
};

const Sidebar: FC<SidebarProps> = ({
  history,
  setCurrentChat,
  deleteChat,
  selectId,
  editName,
  toggleStarred,
  toggleComponentVisibility,
  handleOpenModal,
  togglePersonalize,
  currentChat,
  isMobile,
}) => {
  const LOCAL_STORAGE_ITEM_SHOW_HISTORY = "show-history";
  const [showHistory, setShowHistory] = useState(true);
  const handleNewConversation = () => {
    setCurrentChat(null);
    if (toggleComponentVisibility) {
      toggleComponentVisibility();
    }
  };

  const handleToggleHistory = (checked: boolean) => {
    localStorage.setItem(
      LOCAL_STORAGE_ITEM_SHOW_HISTORY,
      JSON.stringify(checked)
    );
    setShowHistory(checked);
  };

  useEffect(() => {
    const initialValue = localStorage.getItem(LOCAL_STORAGE_ITEM_SHOW_HISTORY);
    setShowHistory(initialValue === "true");
  }, []);

  return (
    <div className="scrollbar-trigger h-full flex w-full flex-1 items-start border-white/20 ">
      <nav className="flex flex-1 flex-col space-y-1 p-2 h-[100dvh] max-w-full">
        <Image
          className="self-center my-5"
          width="75"
          height="75"
          src="https://res.cloudinary.com/pgahq/image/upload/v1695141459/pga-brand-assets/pgaa-logo-rev.png"
          alt="logo"
        />
        <div className="flex-col flex-1 border-b border-white/20 h-1/2">
          <div className="flex flex-col gap-2 pb-2 text-gray-100 text-sm h-full">
            <a
              onClick={handleNewConversation}
              className="flex py-2 px-2 items-center gap-2 relative rounded-md hover:bg-[#2A2B32] cursor-pointer break-all hover:pr-4 group"
            >
              <FiMessageSquare className="h-4 w-4" />
              <div className="flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative">
                New conversation
                <div className="absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-blue-900 group-hover:from-[#2A2B32]"></div>
              </div>
            </a>
            {showHistory && history && (
              <ListChat
                history={history}
                setCurrentChat={setCurrentChat}
                deleteChat={deleteChat}
                selectId={selectId}
                editName={editName}
                toggleStarred={toggleStarred}
                toggleComponentVisibility={toggleComponentVisibility}
              />
            )}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <button className="text-white rounded w-full text-xs flex gap-3 items-center py-2 px-3 hover:bg-gray-500/10">
            <LiaEye size={20} /> Show History
          </button>
          <div>
            <Tooltip className="z-[100]" content={"Show/Hide history"}>
              <ToggleSwitch
                checked={showHistory}
                onChange={handleToggleHistory}
              />
            </Tooltip>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <button
            onClick={handleOpenModal}
            className="text-white rounded w-full text-xs flex gap-3 items-center py-2 px-3 hover:bg-gray-500/10"
          >
            <LiaUserEditSolid size={20} /> Personalize results
          </button>
          {currentChat?.id && (
            <PersonalizeSwitcher
              currentChat={currentChat}
              handleOpenModal={handleOpenModal}
              togglePersonalize={togglePersonalize}
              isMobile={isMobile}
            />
          )}
        </div>

        <a
          target="_blank"
          className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm"
          href="https://docs.google.com/forms/d/e/1FAIpQLScg3ESJUmvQwqeyPTRdKOuNNXN5E9rExSgvKi0Vq9DjIeTf1g/viewform"
        >
          <MdOutlineFeedback className="h-4 w-4" />
          Feedback?
        </a>
        <a
          onClick={() => signOut()}
          className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm"
        >
          <MdLogout className="h-4 w-4" />
          Log out
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;
