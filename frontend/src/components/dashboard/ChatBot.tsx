import { useState, useRef, useEffect } from "react";
import { Send, X, Bot, User, Download, Upload, Sparkles, Zap, Shield, Brain, Activity } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

const SUGGESTION_CHIPS = [
    { icon: Brain, label: "Explain PBFT", prompt: "Explain how the PBFT consensus protocol works in ByzantineMind in simple terms." },
    { icon: Shield, label: "Trust Scores", prompt: "Show me the current trust scores of all 7 agents and explain what they mean." },
    { icon: Zap, label: "View Change", prompt: "What is the View Change protocol and how does ByzantineMind handle primary failure?" },
    { icon: Activity, label: "System Status", prompt: "Give me a complete status report of the current system — agents, faults, queries, and consensus stats." },
];

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: "assistant", content: "👋 Hi! I'm the **ByzantineMind AI Assistant** — powered by Groq Llama 3.3 70B.\n\nI have live access to your system state, trust scores, and consensus history. Ask me anything about:\n- 🔐 **PBFT Consensus** — how 7 agents vote\n- 🛡️ **ArmorIQ** — the security guardrail\n- ⚡ **View Changes** — liveness guarantees\n- 📊 **Trust Scores** — agent reputations\n\nOr try one of the quick actions below! 👇" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMsg: ChatMessage = { role: "user", content: text.trim() };
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

    const handleSend = () => sendMessage(input);
    const handleChip = (prompt: string) => sendMessage(prompt);

    const handleExport = () => {
        window.open(api.exportSession(), "_blank");
    };

    const handleExplain = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";

        const userMsg: ChatMessage = { role: "user", content: `📎 Uploaded **${file.name}** — analyzing session report...` };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const res = await api.uploadSessionReport(file);
            setMessages(prev => [...prev, { role: "assistant", content: res.explanation }]);
        } catch {
            setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Failed to analyze the CSV. Make sure you uploaded a valid ByzantineMind session export." }]);
        } finally {
            setIsLoading(false);
        }
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
                <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] flex flex-col rounded-2xl border border-border/50 bg-background/95 backdrop-blur-2xl shadow-2xl shadow-black/30 animate-in slide-in-from-bottom-5 fade-in duration-300">
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
                                    Groq Llama 3.3 · 7 agents · f=2
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleExplain}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 rounded-lg hover:bg-muted/30 text-muted-foreground hover:text-primary transition-colors"
                                title="Upload Session CSV for AI Analysis"
                            >
                                <Upload className="h-4 w-4" />
                            </button>
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
                                    {msg.role === "assistant" ? (
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                                                strong: ({ children }) => <strong className="font-bold text-primary/90">{children}</strong>,
                                                ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 my-1">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 my-1">{children}</ol>,
                                                li: ({ children }) => <li className="text-[13px]">{children}</li>,
                                                code: ({ children }) => (
                                                    <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                                                ),
                                                h1: ({ children }) => <h1 className="text-base font-bold mt-2 mb-1">{children}</h1>,
                                                h2: ({ children }) => <h2 className="text-sm font-bold mt-2 mb-1">{children}</h2>,
                                                h3: ({ children }) => <h3 className="text-sm font-semibold mt-1.5 mb-0.5">{children}</h3>,
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    ) : (
                                        msg.content.split("\n").map((line, j) => (
                                            <p key={j} className={j > 0 ? "mt-1" : ""}>{line}</p>
                                        ))
                                    )}
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

                    {/* Suggestion Chips */}
                    {messages.length <= 2 && !isLoading && (
                        <div className="px-3 pb-1 flex flex-wrap gap-1.5">
                            {SUGGESTION_CHIPS.map((chip) => (
                                <button
                                    key={chip.label}
                                    onClick={() => handleChip(chip.prompt)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/20 transition-colors border border-primary/20"
                                >
                                    <chip.icon className="h-3 w-3" />
                                    {chip.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-3 border-t border-border/50">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex gap-2"
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about PBFT, trust, attacks, or agents..."
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
