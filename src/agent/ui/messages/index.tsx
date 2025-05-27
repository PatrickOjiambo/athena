import { useTanteiState } from "../context";
import { Swap } from "./blocks/swap";
import Summary from "./blocks/summary";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

export default function Messages() {
    const { messages } = useTanteiState();

    return (
        <div className="flex-1 flex flex-col w-full p-4 gap-y-6 overflow-y-auto">
            {messages.map((message, i) => {
                const timestamp = new Date(parseInt(message.id));
                const isUser = message.blocks.some(
                    (block) => block.name === "USER_MESSAGE",
                );
                const textBlocks = message.blocks.filter(
                    (block) =>
                        block.name === "TEXT" ||
                        (block.props?.content && typeof block.props.content === "string"),
                );

                return (
                    <div
                        key={i}
                        className={`w-full flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                        <div
                            className={`flex flex-col max-w-[80%] ${isUser ? "items-end" : "items-start"}`}
                        >
                            <div
                                className={`rounded-2xl px-4 py-2 ${isUser
                                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] rounded-br-none"
                                    : "bg-[var(--muted)] text-[var(--foreground)] rounded-bl-none"
                                    }`}
                            >
                                {isUser
                                    ? textBlocks.map((block, j) => (
                                        <div key={j} className="whitespace-pre-wrap">
                                            {block.props?.content}
                                        </div>
                                    ))
                                    : null}
                                {message.blocks.map((block, j) => {
                                    if (block.name === "DISPLAY") {
                                        return (
                                            <Summary key={j} content={block.props?.content ?? ""} />
                                            
                                        );
                                    }
                                    if (block.name === "TEXT" && !isUser) {
                                        return (
                                            <ReactMarkdown
                                                key={j}
                                                components={{
                                                    p: ({ node, ...props }) => (
                                                        <p {...props} className="prose dark:prose-invert" />
                                                    ),
                                                }}
                                            >
                                                {block.props?.content ?? ""}
                                            </ReactMarkdown>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                            {(() => {
                                const firstSwapIndex = message.blocks.findIndex(block => block.name === "SWAP");
                                if (firstSwapIndex !== -1) {
                                    const block = message.blocks[firstSwapIndex];
                                    return (
                                        <Swap
                                            key={firstSwapIndex}
                                            toTokenSymbol={block.props.toTokenSymbol}
                                            fromTokenSymbol={block.props.fromTokenSymbol}
                                        />
                                    );
                                }
                                return null;
                            })()}
                            <span className="text-xs text-[var(--muted-foreground)] mt-1">
                                {format(timestamp, "h:mm a")}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
