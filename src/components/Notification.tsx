import { FC } from "react";

interface NotificationProps {
  message: string;
  visible: boolean;
}

const Notification: FC<NotificationProps> = ({ message, visible }) => {
  if (!visible) {
    return <></>;
  }
  return (
    <div className="bg-gray-700 fixed bottom-36 right-2 md:bottom-40 xl:bottom-11 md:right-6 z-[200] min-h-[50px] px-5 flex items-center rounded-lg text-white">
      {message}!
    </div>
  );
};

export default Notification;
