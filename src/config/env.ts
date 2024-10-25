let env: any;
if (process.env.AWS_SSM_SECRETS) {
  const parsed = JSON.parse(process.env.AWS_SSM_SECRETS);
  env = {
    ...parsed,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  };
} else {
  env = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    SECRET: process.env.SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    SERP_API_KEY: process.env.SERP_API_KEY,
    GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    E2B_API_KEY: process.env.E2B_API_KEY,
  };
}

export { env };
