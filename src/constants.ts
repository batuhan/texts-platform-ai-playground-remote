import { OPENAI_SVG_DATA_URI, HUGGINGFACE_SVG_DATA_URI } from "./icons";
import { AIProvider } from "./types";

export enum Api {
  SEARCH_USERS = "searchUsers",
  GET_MESSAGES = "getMessages",
  GET_THREADS = "getThreads",
  GET_THREAD = "getThread",
  CREATE_THREAD = "createThread",
  SEND_MESSAGE = "sendMessage",
  LOGIN = "login",
  INIT = "init",
}

export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

export const PROVIDERS: AIProvider[] = [
  {
    id: "openai",
    fullName: "OpenAI",
    imgURL: OPENAI_SVG_DATA_URI,
  },
  {
    id: "fireworks",
    fullName: "Fireworks.ai",
    imgURL: "https://fireworks.ai/favicon.ico",
  },
  {
    id: "huggingface",
    fullName: "Hugging Face",
    imgURL: HUGGINGFACE_SVG_DATA_URI,
  },
];
