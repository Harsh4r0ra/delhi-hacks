import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, User, Download, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: "assistant", content: "👋 Hi! I'm the **ByzantineMind AI Assistant**. Ask me about PBFT consensus, agent trust scores, or how the ArmorIQ guardrail works!" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: ChatMessage = { role: "user", content: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await api.sendChat(userMsg.content, messages);
            setMessages(prev => [...prev, { role: "assistant", content: res.reply }]);
        } catch {
            setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Sorry, I couldn't connect to the AI backend. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        window.open(api.exportSession(), "_blank");
    };

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
                >
                    <Sparkles className="h-4 w-4" />
                    AI Assistant
                </button>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[560px] flex flex-col rounded-2xl border border-border/50 bg-background/95 backdrop-blur-2xl shadow-2xl shadow-black/30 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border/50 bg-primary/5 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                                <Bot className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">ByzantineMind AI</h3>
                                <span className="text-[10px] text-green-500 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Powered by Groq Llama 3.3
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleExport}
                                className="p-2 rounded-lg hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
                                title="Download Session Report (CSV)"
                            >
                                <Download className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-lg hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                                {msg.role === "assistant" && (
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Bot className="h-3 w-3 text-primary" />
                                    </div>
                                )}
                                <div className={cn(
                                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                                    msg.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-br-md"
                                        : "bg-muted/30 text-foreground border border-border/30 rounded-bl-md"
                                )}>
                                    {msg.content.split("\n").map((line, j) => (
                                        <p key={j} className={j > 0 ? "mt-1" : ""}>{line}</p>
                                    ))}
                                </div>
                                {msg.role === "user" && (
                                    <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <User className="h-3 w-3 text-foreground/60" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-2 items-start">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Bot className="h-3 w-3 text-primary animate-pulse" />
                                </div>
                                <div className="bg-muted/30 rounded-2xl rounded-bl-md px-4 py-3 border border-border/30">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce [animation-delay:0ms]" />
                                        <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce [animation-delay:150ms]" />
                                        <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce [animation-delay:300ms]" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-border/50">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex gap-2"
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about PBFT, trust, or attacks..."
                                className="flex-1 rounded-xl bg-muted/20 border border-border/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="rounded-xl bg-primary px-3 py-2.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
