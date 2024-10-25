# About

This project uses the [opeanai API](https://platform.openai.com/docs/introduction) to implement chat with an assistant and integrate custom interpreter code with [E2B](https://e2b.dev/), as well as using the [Serp API](https://serpapi.com/) for search.

## Requirements

- [Yarn Package Manager](https://yarnpkg.com/getting-started/install)


## Setting Up

1. `Register at https://platform.openai.com/playground/chat?models=gpt-4o for get ASSISTANT_ID`
2. `Register at https://e2b.dev/ for get E2B_API_KEY`
3. `Register at https://serpapi.com/ for get SERP_API_KEY`
4. `Create an .env file and take the values from .env.example and replace the default values with your keys`
5. `You need to install and run Docker https://docs.docker.com/engine/install/, this is for future work with e2b.`
6. `And you need to install the e2b CLI to work with the code interpreter, here is more information on how to do it https://e2b.dev/docs/guide/custom-sandbox,    after installing the e2b CLI, come back to us, we have a lot more interesting things to tell you`

# Getting started

1. `yarn`
2. `e2b template build` - To run this command, the docker must be running. I also have to warn you that the build may take more than 10 minutes to complete, it depends on the number of packages in requirements.txt, if you don't need so many packages to work with the chat, you can remove them.
3. `yarn start`

## How does it work?

In the `ai-pgahq-com/src/pages/api/openai.ts` you can see the full implementation, assisted by the tools. We use the [tools](https://platform.openai.com/docs/guides/function-calling) to work with files and to get more information for gpt answers. In the tools themselves, we use the e2b environment to run code or store files in it for future use (or [download](https://e2b.dev/docs/sandbox/api/download)). We also use [openai.audio.transcriptions](https://platform.openai.com/docs/guides/speech-to-text) to read audio files and process them, for example, we can reduce loud audio files. To generate images (generationImages func), we use the [dall-e-3 model](https://platform.openai.com/docs/guides/images). We store all this in indexDB. Why indexDB? Because we can store much more information in it than in localStorage or Cookies. You can read more about what IndexDB is and how to use it [here](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB). 

