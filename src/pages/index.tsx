import { useState, useEffect } from "react";
import Chat from "@/components/Chat";
import MobileSiderbar from "@/components/MobileSidebar";
import Sidebar from "@/components/Sidebar";
import useHistoryChat from "@/hooks/useHistoryChat";
import useLocalStorage from "@/hooks/useLocalStorage";

import { getServerSession, Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { getNextAuthOptions } from "./api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import PersonalizeResultsModal from "@/components/PersonalizeResultsModal";

export default function Home({ session }: { session: Session }) {
  const [isComponentVisible, setIsComponentVisible] = useState(false);
  const [isPersonalizeModalOpen, setIsPersonalizeModalOpen] = useState(false);
  const [answers, setAnswers] = useLocalStorage<any>("answers", {});
  const [answerCode, setAnswerCode] = useLocalStorage<any>("code", {});
  const [isClient, setIsClient] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const {
    history,
    currentChat,
    setCurrentChat,
    deleteChat,
    editName,
    toggleStarred,
    deleteMessages,
    editAnswerSystem,
    setPersonalize,
    togglePersonalize,
    addThreadId
  } = useHistoryChat();

  const toggleComponentVisibility = () => {
    setIsComponentVisible(!isComponentVisible);
  };

  const handleCloseModal = () => {
    setIsPersonalizeModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsPersonalizeModalOpen(true);
  };

  const handleDeleteChat = (id: number) => {
    deleteChat(id);
    setAnswerCode((currentValue: any) => {
      delete currentValue[id];
      return { ...currentValue };
    });
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    function onlineHandler() {
      setIsOnline(true);
    }

    function offlineHandler() {
      setIsOnline(false);
    }

    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);

    return () => {
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
    };
  }, []);
  return (
    <SessionProvider session={session}>
      <main className="overflow-hidden w-full min-h-[100dvh] relative flex">
        {isComponentVisible ? (
          <MobileSiderbar
            history={history}
            currentChat={currentChat}
            setCurrentChat={setCurrentChat}
            deleteChat={handleDeleteChat}
            selectId={currentChat?.id}
            toggleComponentVisibility={toggleComponentVisibility}
            editName={editName}
            toggleStarred={toggleStarred}
            togglePersonalize={togglePersonalize}
            handleOpenModal={handleOpenModal}
          />
        ) : null}
        <div className="dark hidden flex-shrink-0 bg-blue-900 md:flex md:w-[260px] md:flex-col">
          <div className="flex h-full min-h-0 flex-col ">
            {isClient && (
              <Sidebar
                history={history}
                setCurrentChat={setCurrentChat}
                currentChat={currentChat}
                deleteChat={handleDeleteChat}
                selectId={currentChat?.id}
                editName={editName}
                toggleStarred={toggleStarred}
                handleOpenModal={handleOpenModal}
                togglePersonalize={togglePersonalize}
              />
            )}
          </div>
        </div>
        <Chat
          currentChat={currentChat}
          setCurrentChat={setCurrentChat}
          editName={editName}
          isOnline={isOnline}
          setAnswers={setAnswers}
          setAnswerCode={setAnswerCode}
          answers={answers}
          answerCode={answerCode}
          isComponentVisible={isComponentVisible}
          toggleComponentVisibility={toggleComponentVisibility}
          deleteMessages={deleteMessages}
          editAnswerSystem={editAnswerSystem}
          addThreadId={addThreadId}
        />
        {isPersonalizeModalOpen && (
          <PersonalizeResultsModal
            text={currentChat?.personalize}
            setPersonalize={setPersonalize}
            currentChat={currentChat}
            handleCloseModal={handleCloseModal}
          />
        )}
      </main>
    </SessionProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(
    req,
    res,
    getNextAuthOptions(req, res)
  );
  if (!session) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  return {
    props: {
      session: JSON.parse(JSON.stringify(session)),
    },
  };
};
