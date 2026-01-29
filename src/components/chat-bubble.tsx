import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { ProductCard } from "./product-card";
import { Product } from "@/lib/products";

interface ChatBubbleProps {
    message: any;
}

export function ChatBubble({ message }: ChatBubbleProps) {
    const isUser = message.role === "user";

    return (
        <div
            className={cn(
                "flex w-full items-start gap-4 py-6",
                isUser ? "flex-row-reverse" : "flex-row"
            )}
        >
            <div
                className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border shadow-sm transition-transform hover:scale-105",
                    isUser
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-500 text-white shadow-blue-500/20"
                        : "bg-white border-gray-100 text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 shadow-gray-200/50 dark:shadow-none"
                )}
            >
                {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
            </div>

            <div className={cn("flex max-w-[85%] flex-col gap-3", isUser && "items-end")}>
                {message.parts?.map((part: any, index: number) => {
                    if (part.type === 'text') {
                        return (
                            <div
                                key={index}
                                className={cn(
                                    "rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm transition-all",
                                    isUser
                                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-blue-500/10"
                                        : "bg-white text-gray-800 border border-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800 rounded-tl-none shadow-gray-100/50 dark:shadow-none"
                                )}
                            >
                                {part.text}
                            </div>
                        );
                    }

                    // Handle tool invocations (new format is tool-NAME)
                    if (part.type?.startsWith('tool-')) {
                        const toolName = part.type.replace('tool-', '');
                        const { toolCallId, state, output } = part;

                        if (state === 'output-available') {
                            if (toolName === 'searchProducts') {
                                return (
                                    <div key={toolCallId} className="mt-2 flex w-full flex-col gap-4">
                                        <div className="flex items-center gap-2 px-1">
                                            <div className="h-1 w-1 rounded-full bg-blue-500" />
                                            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                                Found {output?.length || 0} premium items
                                            </span>
                                        </div>
                                        <div className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                            {output?.map((product: Product) => (
                                                <ProductCard key={product.id} product={product} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                        } else if (state === 'output-error') {
                            return (
                                <div key={toolCallId} className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 dark:bg-red-900/10 dark:text-red-400">
                                    Error searching products: {part.errorText}
                                </div>
                            );
                        } else {
                            return (
                                <div key={toolCallId} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white/50 px-4 py-3 text-sm font-medium text-gray-500 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
                                    Peeq is searching...
                                </div>
                            );
                        }
                    }

                    return null;
                })}

                {/* Fallback for older versions or mixed data */}
                {message.content && !message.parts && (
                    <div
                        className={cn(
                            "rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm",
                            isUser
                                ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-blue-500/10"
                                : "bg-white text-gray-800 border border-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800 rounded-tl-none shadow-gray-100/50 dark:shadow-none"
                        )}
                    >
                        {message.content}
                    </div>
                )}
            </div>
        </div>
    );
}
