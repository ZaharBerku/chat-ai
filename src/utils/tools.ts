export const tools: any = [
  {
    type: "function",
    function: {
      name: "generation_images",
      description:
        "This function generates images by description and return in base64. The call only if the final message requires it. Previous messages are not taken into account.",
      parameters: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description:
              "Turn the last user message into a great, detailed prompt for DALL-E. Limit to X tokens",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "serpapi_search",
      description:
        "This function facilitates web research by conducting a Google search query which retrieves data from Google's Knowledge Graph and organic search results. The Knowledge Graph is a vast database of interconnected facts about people, places, and things, enabling the answering of factual queries with a high degree of accuracy and reliability. This function can provide a wealth of verified information from various sources, including public data, licensed data, and direct contributions from content owners. It is ideal for obtaining precise answers to specific questions, as well as for comprehensive research that requires access to a wide range of web content and factual data. The call only if the final message requires it. Previous messages are not taken into account.",
      parameters: {
        type: "object",
        properties: {
          q: {
            type: "string",
            description:
              "The search query to be executed, crafted to extract in-depth, accurate, and pertinent information from both Google's Knowledge Graph and the broader web's organic search results.",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "serpapi_news",
      description:
        "Facilitates news search using SerpAPI, akin to the functionality found in platforms like Google News. Users can execute search queries to retrieve relevant news, allowing them to stay informed about current events, trends, and topics of interest. This function serves as a valuable tool for accessing a curated collection of news articles, similar to the experience provided by dedicated news search features. It enables users to tailor their searches and obtain timely updates on a wide range of subjects directly through the SerpAPI service. The call only if the final message requires it. Previous messages are not taken into account.",
      parameters: {
        type: "object",
        properties: {
          q: {
            type: "string",
            description:
              "The search query used to fetch news, enabling users to specify their areas of interest and receive news articles matching their criteria.",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "execute_shell_command",
      description:
        "Executes shell commands on a Linux system using bash, enabling an AI agent to perform various system-level tasks. This powerful feature demands caution to prevent security risks like command injection or system changes. The agent must understand each command's purpose, behavior, and potential system impact, relying on well-tested commands from trusted sources. System monitoring ('top', 'df'), and network commands ('ping', 'curl'). It's reserved for specific needs that require direct system-level interaction.",
      parameters: {
        type: "object",
        properties: {
          command: {
            type: "string",
            description:
              "The shell command or path to a script to be executed. It should be a single, well-formed command or a properly escaped sequence of commands if chaining is required.",
          },
        },
        required: ["command"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "execute_install_packages",
      description:
        "Executes the installation of the specified Python packages. This function should be called before executing code that depends on these packages.",
      parameters: {
        type: "object",
        properties: {
          packages: {
            type: "string",
            description: "Is the name of the packages to install",
          },
        },
        required: ["packages"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "exec_code",
      description:
        "Whenever you send a message containing Python code, it will be executed in a stateful Jupyter notebook environment. The tool will respond with the output of the execution or time out after 60.0 seconds. You have access to a drive at 'home/user' to save and persist user files.",
      parameters: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description:
              "The Python code to execute and always return result in print func.",
          },
        },
        required: ["code"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_links",
      description: "This function reads links using the generated code",
      parameters: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description:
              "Code that will read the content of the page and wrap it",
          },
          packages: {
            type: "string",
            description: "Is the name of the packages to install",
          },
        },
        required: ["code"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_audio_files",
      description:
        "This function get text from AUDIO files type ONLY .mp3, .mp4, .mpeg, .mpga, .m4a, .wav, and .webm NOT for .pdf or something like this",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description:
              "Full path to file only with type .mp3, .mp4, .mpeg, .mpga, .m4a, .wav, and .webm",
          },
          filename: {
            type: "string",
            description:
              "File name with type .mp3, .mp4, .mpeg, .mpga, .m4a, .wav, and .webm",
          },
        },
        required: ["path", "filename"],
      },
    },
  },
];
