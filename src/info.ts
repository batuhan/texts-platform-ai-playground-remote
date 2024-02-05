import {
  PlatformInfo,
  MessageDeletionMode,
  Attribute,
} from "@textshq/platform-sdk";

const info: PlatformInfo = {
  name: "platform-remote",
  version: "1.0.0",
  displayName: "Platform Remote",
  icon: `<svg width="1em" height="1em" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 500C0 223.858 223.858 0 500 0C776.142 0 1000 223.858 1000 500C1000 776.142 776.142 1000 500 1000H62.5C27.9822 1000 0 972.017 0 937.5V500Z" fill="currentColor" />
</svg>`,
  loginMode: "custom",
  deletionMode: MessageDeletionMode.UNSUPPORTED,
  attributes: new Set([
    Attribute.CANNOT_MESSAGE_SELF,
    Attribute.NO_SUPPORT_GROUP_THREAD_CREATION,
    Attribute.NO_SUPPORT_TYPING_INDICATOR,
  ]),
};

export default info;
