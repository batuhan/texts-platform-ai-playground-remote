import {
  CurrentUser,
  ExtraProp,
  Message,
  Paginated,
  Thread,
} from "@textshq/platform-sdk";

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

export interface LoginAPIResult extends ExtraProp {
  currentUser: CurrentUser;
}

export type AIProviderID = "openai" | "fireworks" | "huggingface";

export type AIProvider = {
  id: AIProviderID;
  fullName: string;
  imgURL: string;
};
