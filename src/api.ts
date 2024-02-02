import {
  Awaitable,
  CurrentUser,
  InboxName,
  LoginCreds,
  LoginResult,
  Message,
  MessageContent,
  MessageSendOptions,
  OnServerEventCallback,
  Paginated,
  PaginatedWithCursors,
  PaginationArg,
  PlatformAPI,
  SerializedSession,
  ServerEvent,
  ServerEventType,
  StateSyncEvent,
  Thread,
  ThreadFolderName,
  User,
} from "@textshq/platform-sdk";
import { randomUUID as uuid } from "crypto";
import { Api, DEFAULT_HEADERS } from "./constants";
import WebSocket from "ws";
import { ResponseMessage, ResponseThread } from "./types";

export default class PlatformRemote implements PlatformAPI {
  private baseURL: string = "";
  private currentUser: CurrentUser = {
    id: "",
    username: "User",
    displayText: "User",
  };
  private credential: string = "";
  private eventHandler: OnServerEventCallback;
  private websocket: WebSocket;

  init = (session: SerializedSession) => {
    if (session) {
      this.baseURL = session.baseURL;
      this.currentUser = session.currentUser;
      this.credential = session.credential;
      const url = new URL(session.baseURL);
      const wsUrl = `ws://${url.host}`;
      this.initWebsocket(wsUrl);
    }
  };

  dispose = () => {
    if (this.websocket) this.websocket.close();
  };

  getCurrentUser = () => this.currentUser;

  login = async (creds?: LoginCreds): Promise<LoginResult> => {
    const loginCreds =
      creds && "custom" in creds && creds.custom && creds.custom.baseURL;

    if (!loginCreds)
      return { type: "error", errorMessage: "Invalid credentials" };

    try {
      const baseURL = new URL(creds.custom.baseURL);
      this.baseURL = baseURL.origin;

      const wsUrl = `ws://${baseURL.host}`;
      this.initWebsocket(wsUrl);
      const body = JSON.stringify({ creds: creds });
      const { data }: { data: CurrentUser } = await this.fetchRemote(
        Api.LOGIN,
        body
      );
      this.currentUser = data;
    } catch {
      return { type: "error", errorMessage: "Invalid credentials" };
    }

    return { type: "success" };
  };

  serializeSession = () => {
    return {
      baseURL: this.baseURL,
      currentUser: this.currentUser,
      credential: this.credential,
    };
  };

  subscribeToEvents = (onEvent: OnServerEventCallback) => {
    this.eventHandler = onEvent;
  };

  searchUsers = async (typed: string) => {
    const body = JSON.stringify({
      userID: this.currentUser.id,
      credential: this.credential,
      typed,
    });
    const response = await this.fetchRemote(Api.SEARCH_USERS, body);
    const users: User[] = response.data;
    return users;
  };

  getThreads = async (
    inboxName: ThreadFolderName,
    pagination?: PaginationArg | undefined
  ) => {
    if (inboxName === InboxName.REQUESTS) {
      return {
        items: [] as Thread[],
        hasMore: false,
        oldestCursor: "0",
      };
    }

    const body = JSON.stringify({
      userID: this.currentUser.id,
      credential: this.credential,
      inboxName,
      pagination,
    });
    const { data }: { data: PaginatedWithCursors<ResponseThread> } =
      await this.fetchRemote(Api.GET_THREADS, body);

    const responseThreads = data.items;

    // Map the Date strings from response data to the platform-sdk Thread type
    const threads = responseThreads.map((thread: ResponseThread) => {
      const newThread: Thread = {
        ...thread,
        timestamp: new Date(thread.timestamp),
        createdAt: new Date(thread.createdAt),
        messages: {
          items: thread.messages.items.map((message: ResponseMessage) => {
            return {
              ...message,
              timestamp: new Date(message.timestamp),
            };
          }),
          hasMore: thread.messages.hasMore,
        },
      };
      return newThread;
    });

    const mappedData: PaginatedWithCursors<Thread> = {
      items: threads,
      hasMore: data.hasMore,
      oldestCursor: data.oldestCursor,
    };

    return mappedData;
  };

  getMessages = async (threadID: string, pagination?: PaginationArg) => {
    const body = JSON.stringify({
      userID: this.currentUser.id,
      credential: this.credential,
      threadID,
      pagination,
    });

    const { data }: { data: Paginated<ResponseMessage> } =
      await this.fetchRemote(Api.GET_MESSAGES, body);

    const responseMessages: ResponseMessage[] = data.items;
    const messages: Message[] = responseMessages.map(
      (message: ResponseMessage) => {
        return {
          ...message,
          timestamp: new Date(message.timestamp),
        };
      }
    );

    return {
      items: messages,
      hasMore: data.hasMore,
    };
  };

  createThread = async (
    userIDs: string[],
    title?: string,
    messageText?: string
  ) => {
    const body = JSON.stringify({
      userID: this.currentUser.id,
      credential: this.credential,
      userIDs,
      title,
      messageText,
    });
    const response = await this.fetchRemote(Api.CREATE_THREAD, body);
    const createThreadResponse: Thread = {
      ...response.data,
      timestamp: new Date(response.data.timestamp),
    };
    return createThreadResponse;
  };

  getThread = async (threadID: string): Promise<Thread> => {
    const body = JSON.stringify({
      userID: this.currentUser.id,
      credential: this.credential,
      threadID,
    });
    const response = await this.fetchRemote(Api.GET_THREAD, body);
    const getThreadResponse: Thread = response.data;
    return getThreadResponse;
  };

  sendMessage = async (
    threadID: string,
    content: MessageContent,
    options?: MessageSendOptions
  ) => {
    const { text } = content;

    if (!text) return false;

    const messageID = options?.pendingMessageID;

    const userMessage: Message = {
      id: messageID || uuid(),
      timestamp: new Date(),
      text,
      senderID: this.currentUser.id,
      isSender: true,
      isDelivered: true,
    };

    const body = JSON.stringify({
      userID: this.currentUser.id,
      credential: this.credential,
      userMessage,
      threadID,
      content,
      options,
    });
    const response = await this.fetchRemote(Api.SEND_MESSAGE, body);

    if (response.data) {
      const responseMessage: Message = {
        ...response.data,
        timestamp: new Date(response.data.timestamp),
      };

      const event: ServerEvent = {
        type: ServerEventType.STATE_SYNC,
        objectName: "message",
        mutationType: "upsert",
        objectIDs: { threadID },
        entries: [responseMessage],
      };
      this.eventHandler([event]);
    }

    return [userMessage];
  };

  sendActivityIndicator = () => {};
  sendReadReceipt = () => {};

  fetchRemote(
    path: string,
    body?: string
  ): Awaitable<{ data: any; headers: any }> {
    // Construct a URL object from the base URL and the path
    const url = new URL(this.baseURL + `/api/${path}`);

    // Make the request
    return fetch(url.toString(), {
      method: "POST",
      headers: DEFAULT_HEADERS,
      body: body,
    }).then((res) => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    });
  }

  initWebsocket = (wsUrl: string) => {
    const userID = this.currentUser.id;
    this.websocket = new WebSocket(wsUrl, {
      headers: {
        ["user-id"]: userID,
      },
    });
    this.websocket.onopen = () => {
      console.log("[platform-rest] connected to platform-rest-ws");
    };

    // Manage incoming server events
    this.websocket.onmessage = (event) => {
      console.log("[platform-rest] recieved event");
      const eventJSON: ServerEvent = JSON.parse(event.data.toString());

      if ("entries" in eventJSON) {
        const serverEvent: StateSyncEvent = {
          ...eventJSON,
          entries: eventJSON.entries.map((entry) => {
            return {
              ...entry,
              timestamp: new Date(entry.timestamp),
            };
          }),
        };

        this.eventHandler([serverEvent]);
      }
    };
  };
}
