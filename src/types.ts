import { Message, Paginated, Thread } from "@textshq/platform-sdk";

export type ResponseMessage = Omit<Message, "timestamp"> & {
  timestamp: string;
};

export type ResponseThread = Omit<
  Thread,
  "createdAt" | "timestamp" | "messages"
> & {
  createdAt: string;
  timestamp: string;
  messages: Paginated<ResponseMessage>;
};
