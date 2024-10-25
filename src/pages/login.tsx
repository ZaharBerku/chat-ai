import { signIn } from 'next-auth/react';
import { useSearchParams } from "next/navigation";
import Image from 'next/image';

import LoginButton from '@/components/LoginButton';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { getNextAuthOptions } from './api/auth/[...nextauth]';

export default function Unauthorized() {
  const params = useSearchParams();
  const isBlocked = Boolean(params.get("error"));
  const handleLogIn = () => {
    signIn("google", undefined, {
      prompt: "select_account",
    });
  };
  return (
    <div className="bg-blue-800 flex justify-center items-center flex-col space-y-4 w-full min-h-screen">
      <div className="flex flex-col justify-center items-center space-y-4 h-screen">
        <Image
          width="150"
          height="150"
          src="https://res.cloudinary.com/pgahq/image/upload/v1695141459/pga-brand-assets/pgaa-logo-rev.png"
          alt="logo"
          style={{ margin: 20 }}
        />
        <p className="text-white text-center">
          Welcome to PGA GPT. Login with your Google account below.
        </p>
        <LoginButton handleClick={handleLogIn}>
          <div>Login</div>
        </LoginButton>
        {isBlocked && <span className="text-white">This platform can only be accessed by PGA of America employees</span>}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (props) => {
  const { req, res } = props;
  const session = await getServerSession(req, res, getNextAuthOptions(req, res))
    if (session) {
      return {
        redirect: { destination: '/', permanent: false }
      }
    }

    return {
      props: {
      }
    }
}