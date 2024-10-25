import GoogleProvider from "next-auth/providers/google";
import { env } from "../../../config/env";
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import NextAuth, { NextAuthOptions } from "next-auth";

const allowedDomains = [
  "pgahq.com",
  "coloradopga.com",
  "gspga.com",
  "highschoolgolf.org",
  "indianagolf.org",
  "iowapga.com",
  "kygolf.org",
  "mapga.com",
  "michiganpga.com",
  "michiganpgagolf.com",
  "nccga.org",
  "ncpgalinks.com",
  "nextgengolf.org",
  "pgaclubchamp.org",
  "pgafamilygolf.com",
  "pgagolfclub.com",
  "pgareach.org",
  "pgateamgolf.com",
  "phillyjuniortour.com",
  "scpga.com",
  "tennpga.com",
  "tngolf.org",
  "westernnewyork.pga.com",
  "aleannlab.com",
  "e2b.dev",
];

export const getNextAuthOptions = (
  req: NextApiRequest | GetServerSidePropsContext["req"],
  res: NextApiResponse | GetServerSidePropsContext["res"]
) => {
  const { host } = req.headers;

  const authOptions: NextAuthOptions = {
    providers: [
      GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID as string,
        clientSecret: env.GOOGLE_CLIENT_SECRET as string,
      }),
    ],
    pages: {
      error: "/login",
    },
    callbacks: {
      async signIn({ account, profile }) {
        if (account?.provider === "google") {
          //TODO: remove email after test
          return (
            profile?.email === "dubovyknazar@gmail.com" ||
            allowedDomains.some(
              (domain) => profile?.email?.endsWith(`@${domain}`)
            )
          );
        }
        return true;
      },
    },
    secret: env.SECRET as string,
  };
  return authOptions;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const authOptions = getNextAuthOptions(req, res);
  return NextAuth(req, res, authOptions);
}
