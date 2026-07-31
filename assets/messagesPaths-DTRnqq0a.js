import { dS as paths } from "./index-DwV1qlqh.js";
function messagesInboxPath() {
  return paths.messages;
}
function messagesThreadPath(peerUserId) {
  return `${paths.messages}/${encodeURIComponent(peerUserId)}`;
}
export {
  messagesThreadPath as a,
  messagesInboxPath as m
};
