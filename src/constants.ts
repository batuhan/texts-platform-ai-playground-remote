export enum Api {
  SEARCH_USERS = "searchUsers",
  GET_MESSAGES = "getMessages",
  GET_THREADS = "getThreads",
  GET_THREAD = "getThread",
  CREATE_THREAD = "createThread",
  SEND_MESSAGE = "sendMessage",
  LOGIN = "login",
}

export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};