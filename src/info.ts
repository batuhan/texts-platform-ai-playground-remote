import {
  PlatformInfo,
  MessageDeletionMode,
  Attribute,
} from "@textshq/platform-sdk";
import { PLATFORM_ICON } from "./icons";

const info: PlatformInfo = {
  name: "platform-ai-playground-rest",
  version: "1.0.0",
  displayName: "platform-ai-playground-rest",
  icon: PLATFORM_ICON,
  loginMode: "custom",
  deletionMode: MessageDeletionMode.UNSUPPORTED,
  attributes: new Set([
    Attribute.CANNOT_MESSAGE_SELF,
    Attribute.NO_SUPPORT_GROUP_THREAD_CREATION,
    Attribute.NO_SUPPORT_TYPING_INDICATOR,
  ]),
};

export default info;
