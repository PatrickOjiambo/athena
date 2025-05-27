import { TanteiContextWrapper } from "./context";
import MessageInput from "./input";
import Messages from "./messages";

export default function Tantei() {
  return (
    <TanteiContextWrapper>
      <_Tantei />
    </TanteiContextWrapper>
  );
}

function _Tantei() {
  return (
    <div className="w-full h-full p-5 flex flex-col rounded-md overflow-hidden">
      <Messages />
      <MessageInput />
    </div>
  );
}
