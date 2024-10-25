import { DEFAULT_OPENAI_MODEL } from "@/shared/Constants";
import formidable from "formidable";
import path from "path";
import fs from "node:fs";
import {
  OpenAIModel,
  Messages,
  MessageSystem,
  MessageUser,
  promptMessage,
} from "@/types/Model";
import * as dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import {
  closeWithTimeout,
  getCodeInterpreter,
} from "@/utils/getCodeInterpreter";
import { getSandboxIdFromCookie } from "@/utils/getSandboxIdFromCookie";
import { getAssistantsIdCookie } from "@/utils/getAssistantsIdCookie";
import { getImageTypeFromBase64 } from "@/utils/getImageTypeFromBase64";
import { env } from "../../config/env";
import { tools } from "@/utils/tools";
import { observeStream } from "@/utils/observeStream";
import { getJson } from "serpapi";

// Get your environment variables
dotenv.config();

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const config = {
  api: {
    bodyParser: false,
  },
  supportsResponseStreaming: true,
};

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const serpapiSearch = async (params: any, res: NextApiResponse) => {
  res.write(
    JSON.stringify({
      loader: { name: "search", isLoading: true },
    })
  );
  const response = await getJson({
    api_key: env.SERP_API_KEY,
    ...params,
  });
  res.write(
    JSON.stringify({
      loader: { name: "search", isLoading: false },
    })
  );
  return {
    organic_results: response.organic_results,
    knowledge_graph: response.knowledge_graph,
  };
};

const serpapiNews = async (params: any, res: NextApiResponse) => {
  res.write(
    JSON.stringify({
      loader: { name: "search", isLoading: true },
    })
  );
  const response = await getJson({
    api_key: env.SERP_API_KEY,
    tbm: "nws",
    ...params,
  });
  res.write(
    JSON.stringify({
      loader: { name: "search", isLoading: false },
    })
  );
  return {
    news_results: response.news_results,
  };
};

const generationImages = async (params: any, res: NextApiResponse) => {
  res.write(
    JSON.stringify({ loader: { name: "generating", isLoading: true } })
  );
  const result = await openai.images.generate({
    prompt: params.prompt,
    model: "dall-e-3",
    size: "1792x1024",
  });
  res.write(
    JSON.stringify({
      loader: { name: "generating", isLoading: false },
    })
  );
  return {
    isReturnImage: true,
    image: result.data,
  };
};

const execCode = async (
  params: any,
  res: NextApiResponse,
  codeInterpreter: any
) => {
  try {
    await delay(2000);
    res.write(
      JSON.stringify({
        loader: {
          name: "code",
          isLoading: true,
          code: params.code,
          nameCode: "code",
        },
      })
    );
    const execution = await codeInterpreter.notebook.execCell(params.code);
    const firstResult = execution.results[0];
    if (firstResult && (firstResult?.png || firstResult?.svg)) {
      await delay(2000);
      res.write(
        JSON.stringify({
          loader: {
            name: "code",
            isLoading: false,
            code: firstResult.text,
            nameCode: "result",
          },
          data: {
            date: new Date().toISOString(),
            image: firstResult.png || firstResult.svg,
            type: "base64",
          },
        })
      );
      return {
        isReturnImage: true,
      };
    }
    await delay(2000);
    res.write(
      JSON.stringify({
        loader: {
          name: "code",
          isLoading: false,
          code:
            firstResult?.text ||
            execution.logs.stdout.join(" ") ||
            execution.logs.stderr.join(" ") ||
            execution.error,
          nameCode: "result",
        },
      })
    );
    await delay(2000);
    return {
      results: execution.results,
      stdout: execution.logs.stdout,
      stderr: execution.logs.stderr,
      error: execution.error,
    };
  } catch (error) {
    await delay(2000);
    res.write(
      JSON.stringify({
        loader: { name: "failed" },
      })
    );
    res.end();
    console.log("start error", error, "execCode");
  }
};

const executeInstallPackages = async (
  params: any,
  res: NextApiResponse,
  codeInterpreter: any
) => {
  res.write(JSON.stringify({ loader: { name: "install", isLoading: true } }));
  await codeInterpreter.process
    .startAndWait(`pip install ${params.packages.split(",")}`)
    .then(() => {
      res.write(
        JSON.stringify({
          loader: { name: "install", isLoading: false },
        })
      );
    })
    .catch(async (error: any) => {
      await delay(2000);
      res.write(
        JSON.stringify({
          loader: { name: "failed" },
        })
      );
      res.end();
      console.log("start error", error, "installPythonPackages");
    });
  return null;
};

const executeShellCommand = async (
  params: any,
  res: NextApiResponse,
  codeInterpreter: any
) => {
  await delay(2000);
  res.write(
    JSON.stringify({
      loader: {
        name: "execute",
        isLoading: true,
        code: params.command,
        nameCode: "code",
      },
    })
  );
  const result = {
    stdout: "",
    stderr: "",
  };
  await codeInterpreter.process.startAndWait({
    cmd: params.command,
    onStdout: (data: any) => (result.stdout = result.stdout + " " + data.line),
    onStderr: (data: any) => (result.stderr = result.stderr + " " + data.line),
  });
  await delay(2000);
  res.write(
    JSON.stringify({
      loader: {
        name: "execute",
        isLoading: false,
        code: result.stdout || result.stderr,
        nameCode: "result",
      },
    })
  );
  return { stdout: result.stdout, stderr: result.stderr };
};

const readAudioFiles = async (
  params: any,
  res: NextApiResponse,
  codeInterpreter: any
) => {
  try {
    const buffer = await codeInterpreter.downloadFile(params.path, "buffer");
    const filePath = path.resolve("./", `tmp/${params.filename}`);
    fs.writeFileSync(filePath, buffer);
    const readStream = fs.createReadStream(filePath);
    const data = await openai.audio.transcriptions.create({
      file: readStream,
      model: "whisper-1",
    });
    fs.unlinkSync(filePath);
    return {
      text: data.text,
    };
  } catch (error: any) {
    await delay(2000);
    res.write(
      JSON.stringify({
        loader: { name: "failed" },
      })
    );
    res.end();
    console.log("start error", error, "readAudioFiles");
  }
};

const getAssistantsId = async (
  promptMessage: any,
  cookieHeader: any,
  res: any,
  additionalInfo: string
) => {
  let assistantId = null;
  const assistantIdCookie = getAssistantsIdCookie(cookieHeader);
  if (assistantIdCookie) {
    assistantId = assistantIdCookie;
  } else {
    const assistant = await openai.beta.assistants.create({
      name: promptMessage.name,
      instructions: `${promptMessage.instructions} ${additionalInfo}`,
      tools: [{ type: "code_interpreter" }, { type: "file_search" }, ...tools],
      model: "gpt-4o",
    });

    assistantId = assistant.id;
  }
  return assistantId;
};

const completionsChat = async (
  cookieHeader: any,
  message: any,
  promptMessage: promptMessage,
  chatId: any,
  res: any,
  arrayFiles: any,
  files: any
) => {
  try {
    let currentChatId = chatId;
    if (!chatId) {
      const thread = await openai.beta.threads.create();
      currentChatId = thread.id;
    }
    const additionalInfo = ` AdditionalInfo" use "api/download?Filename=filename&threadId=${currentChatId}" to create download link in response" `;

    const assistantId = await getAssistantsId(
      promptMessage,
      cookieHeader,
      res,
      additionalInfo
    );
    if (files?.length) {
      const attachments = await Promise.all(
        files.map(async (file: any) => {
          const currentFile = file.at(0);
          const fileBuffer = fs.readFileSync(currentFile.filepath);
          const filePath = `tmp/${currentFile.originalFilename}`;
          const fileId = await getFileId(filePath, fileBuffer);
          return { file_id: fileId, tools: [{ type: "file_search" }] };
        })
      );
      message.attachments = attachments;
    }

    if (message.content.length > 1) {
      const contentForTreads = await Promise.all(
        message.content.map(async (message: any, index: number) => {
          if (index) {
            const base64 = message.image_url.url;
            const type = getImageTypeFromBase64(base64);
            const result = base64?.split(",")[1];
            const buffer = Buffer.from(result, "base64");
            const filePath = `tmp/${Date.now()}-image.${type}`;
            return {
              type: "image_file",
              image_file: {
                file_id: await getFileId(filePath, buffer),
              },
            };
          }
          return message;
        })
      );

      message.content = contentForTreads;
    }

    if (arrayFiles.length) {
      message.content.at(0).text =
        message.content.at(0).text + " " + arrayFiles.join(",");
    }
    await openai.beta.threads.messages.create(currentChatId, {
      role: message.role,
      ...message,
    });
    return { currentChatId, assistantId };
  } catch (error: any) {
    await delay(2000);
    res.write(
      JSON.stringify({
        loader: { name: "failed" },
      })
    );
    res.end();
    console.log("start error", error, "completionsChat");
  }
};

const processStream = async (
  currentChatId: any,
  assistantId: any,
  res: any,
  codeInterpreter: any
) => {
  const availableFunctions: any = {
    serpapi_search: serpapiSearch,
    serpapi_news: serpapiNews,
    generation_images: generationImages,
    exec_code: execCode,
    execute_shell_command: executeShellCommand,
    execute_install_packages: executeInstallPackages,
    read_links: execCode,
    read_audio_files: readAudioFiles,
  };
  const func: { type: any }[] = [];
  const stream = openai.beta.threads.runs.stream(currentChatId, {
    assistant_id: assistantId,
  });

  observeStream(
    stream,
    openai,
    availableFunctions,
    codeInterpreter,
    res,
    currentChatId
  );

  return func.length
    ? {
        role: "assistant",
        content: null,
        tool_calls: func,
      }
    : null;
};

const getArrayFiles = async (files: any, codeInterpreter: any) => {
  const arrayFiles = await Promise.all(
    files.map((file: any) => {
      const fileBuffer = fs.readFileSync(file.at(0).filepath);
      return codeInterpreter?.uploadFile(
        fileBuffer,
        file.at(0).originalFilename.replaceAll(" ", "")
      );
    })
  );
  return arrayFiles;
};

const getFileId = async (filePath: string, buffer: Buffer) => {
  fs.writeFileSync(filePath, buffer);
  try {
    const readStream = fs.createReadStream(filePath);
    const file = await openai.files.create({
      file: readStream,
      purpose: "assistants",
    });
    fs.unlinkSync(filePath);

    return file.id;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const form = formidable({});
  const dataForm = await form.parse(req);
  const [data, filesArray]: any = dataForm;

  const body = JSON.parse(data?.data?.at(0));
  const { messages, files: oldFiles }: { messages: Messages; files: any } = (
    body?.messages || []
  )
    .filter((message: MessageSystem | MessageUser) => message.content)
    .reduce(
      (item: any, { files, data, ...message }: any) => {
        if (message) {
          item.messages.push(message);
        }
        if (files) {
          item.files.push(files);
        }
        return item;
      },
      {
        messages: [],
        files: [],
      }
    );
  const chatId = body?.currentChatId?.toString()?.includes("thread")
    ? body?.currentChatId
    : "";

  const model = (body?.model || DEFAULT_OPENAI_MODEL) as OpenAIModel;
  const files = Object.values(filesArray);
  const cookieHeader = req.headers.cookie;

  const sandboxOldId = getSandboxIdFromCookie(cookieHeader, chatId);
  const codeInterpreter = await getCodeInterpreter(sandboxOldId, env);
  try {
    const date = new Date();
    // Set the expiration time to 10 minutes from now
    date.setTime(date.getTime() + 10 * 60 * 1000);
    const expires = date.toUTCString();

    const arrayFiles = await getArrayFiles(files, codeInterpreter);
    const latestMessage = messages.at(-1);

    const promptMessage: promptMessage = {
      name: "PGA Assistant.",
      instructions: `Assume that the user works for PGA of America and the user name is ${
        body.name
      }. Don't explicitly mention this information unless it's necessary for your response. Keep it casual, but professional. And take this information into account when answering the following questions ${
        body.personalize || ""
      }.You also have built-in tools, such as file_search, which is used to work with files and you use E2B to execute commands or parts of the code - The E2B  offering a codeInterpreter runtime with capabilities such as executing Python scripts and running shell commands like pip and And also in E2B and to check which packages are installed in the environment, you can run the pip list command or install new ones as needed. when u return any picture replace all "&amp;" to "&" in images href. 
      If u have question about files, you need to check attached files and giv answer using all attached files to current message or if no attached files to current message you must use files attached to tread. If no any files u need to ask about file and do the task with file. U can not answer that you cant do something until u try use E2B. After modification the file by E2B u need to return download link. Please use all tools. Retry until u be able to do the task. Newer do not answer
      to user it text on additionalInfo"some info", but use it as a technical info or instructions. Also the e2b environment already has these packages loaded, which you can use: Babel Brotli
      CairoSVG
      Cython
      Faker
      Flask-CacheBuster
      Flask-Cors
      Flask-Login
      Jinja2
      MarkupSafe
      Pillow
      PyJWT
      PyMuPDF
      PyNaCl
      PyPDF2
      PyYAML
      Send2Trash
      Shapely
      SoundFile
      Wand
      XlsxWriter
      absl-py
      ace
      aeppl
      aesara
      affine
      aiohttp
      aiosignal
      analytics-python
      anyio
      anytree
      argon2-cffi
      argon2-cffi-bindings
      arviz
      asn1crypto
      async-timeout
      attrs
      audioread
      backoff
      bcrypt
      beautifulsoup4
      bleach
      blinker
      blis
      blosc2
      bokeh
      branca
      cachetools
      cairocffi
      camelot-py
      catalogue
      certifi
      cffi
      chardet
      charset-normalizer
      click
      click-plugins
      cligj
      cloudpickle
      cmake
      cmudict
      comm
      confection
      cons
      contourpy
      countryinfo
      cryptography
      cssselect2
      cycler
      cymem
      databricks-sql-connector
      debugpy
      decorator
      defusedxml
      dnspython
      docx2txt
      einops
      email-validator
      entrypoints
      et-xmlfile
      etuples
      exchange-calendars
      executing
      fastapi
      fastjsonschema
      fastprogress
      ffmpeg-python
      ffprobe-python
      ffmpy
      filelock
      Flask
      folium
      fonttools
      fpdf
      frozenlist
      future
      fuzzywuzzy
      gensim
      geographiclib
      geopy
      gradio
      graphviz
      gTTS
      h11
      h2
      h5netcdf
      hpack
      html5lib
      httpcore
      httptools
      httpx
      hypercorn
      hyperframe
      idna
      imageio
      imageio-ffmpeg
      imgkit
      importlib-metadata
      importlib-resources
      iniconfig
      ipykernel
      ipython
      ipython-genutils
      isodate
      itsdangerous
      jax
      jedi
      joblib
      json5
      jsonpickle
      jsonschema
      jsonschema-specifications
      jupyter_client
      jupyter_core
      jupyter-server
      jupyterlab
      jupyterlab-pygments
      jupyterlab_server
      keras
      kerykeion
      kiwisolver
      korean-lunar-calendar
      langcodes
      lazy_loader
      librosa
      lit
      llvmlite
      logical-unification
      loguru
      lxml
      markdown2
      markdownify
      matplotlib
      matplotlib-inline
      matplotlib-venn
      miniKanren
      mistune
      mizani
      mne
      monotonic
      moviepy
      mpmath
      msgpack
      mtcnn
      multidict
      multipledispatch
      munch
      murmurhash
      mutagen
      nashpy
      nbclassic
      nbclient
      nbconvert
      nbformat
      nest-asyncio
      networkx
      nltk
      notebook
      notebook_shim
      numba
      numexpr
      numpy
      numpy-financial
      odfpy
      opencv-python
      openpyxl
      opt-einsum
      orjson
      oscrypto
      packaging
      pandas
      pandocfilters
      paramiko
      parso
      pathlib_abc
      pathy
      patsy
      pdf2image
      pdfkit
      pdfminer.six
      pdfplumber
      pdfrw
      pexpect
      pip
      platformdirs
      plotly
      plotnine
      pluggy
      pooch
      preshed
      priority
      proglog
      prometheus_client
      prompt-toolkit
      pronouncing
      psutil
      ptyprocess
      pure-eval
      py
      py-cpuinfo
      pycountry
      pycparser
      pycryptodome
      pycryptodomex
      pydantic
      pydot
      pydub
      pydyf
      Pygments
      pylog
      pyluach
      PyOpenSSL
      pypandoc
      pyparsing
      pyphen
      pyproj
      pyprover
      pyshp
      pyswisseph
      pytesseract
      pytest
      pyth3
      python-dateutil
      python-docx
      python-dotenv
      python-multipart
      python-pptx
      pyttsx3
      pytz
      PyWavelets
      pyxlsb
      pyzbar
      pyzmq
      qrcode
      rarfile
      rdflib
      referencing
      regex
      reportlab
      requests
      resampy
      rpds-py
      scikit-image
      scikit-learn
      scipy
      seaborn
      sentencepiece
      setuptools
      shap
      six
      slicer
      smart-open
      sniffio
      snowflake-connector-python
      snuggs
      soupsieve
      srsly
      stack-data
      starlette
      statsmodels
      svglib
      svgwrite
      sympy
      tables
      tabula
      tabulate
      tenacity
      terminado
      text-unidecode
      textblob
      thinc
      threadpoolctl
      thrift
      tifffile
      tinycss2
      toml
      tomli
      typer
      typing_extensions
      ujson
      urllib3
      uvicorn
      uvloop
      wasabi
      watchfiles
      wcwidth
      weasyprint
      webencodings
      websocket-client
      websockets
      Werkzeug
      wheel
      wordcloud
      wsproto
      xarray
      xarray-einstats
      xgboost
      xml-python
      yarl
      zipp
      zopfli. Thanks.`,
    };

    const result = await completionsChat(
      cookieHeader,
      latestMessage,
      promptMessage,
      chatId,
      res,
      arrayFiles,
      files
    );
    if (result) {
      res.setHeader("Set-Cookie", [
        `sandboxId_${result.currentChatId}=${
          codeInterpreter?.id ? codeInterpreter?.id : ""
        }; path=/; Expires=${expires};`,
        `assistant_id=${result.assistantId}; path=/;`,
      ]);

      if (!chatId) {
        const dataToWrite = JSON.stringify({
          loader: {
            name: "creating_conversation",
            isLoading: false,
            chatId: result.currentChatId,
          },
        });
        res.write(dataToWrite);
      }

      await processStream(
        result?.currentChatId,
        result.assistantId,
        res,
        codeInterpreter
      );
    }

    // Cleanup function
    req.on("close", async () => {
      res.end();
      await closeWithTimeout(codeInterpreter);
    });

    req.on("error", async () => {
      res.end();
      await closeWithTimeout(codeInterpreter);
    });
  } catch (error) {
    console.error(error);

    res.write(
      JSON.stringify({
        loader: { name: "failed" },
      })
    );

    res.end();
    await closeWithTimeout(codeInterpreter);

    res.status(500).json({
      error: "An error occurred during ping to OpenAI. Please try again.",
    });
  }
}
