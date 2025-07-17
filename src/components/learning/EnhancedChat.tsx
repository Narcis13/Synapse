"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Send, 
  Mic, 
  MicOff, 
  Play, 
  Clock,
  Code2,
  BookOpen,
  Loader2,
  Volume2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils/audio";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface AudioReference {
  timestamp: number; // in seconds
  duration: number;
  text: string;
  chunkId: Id<"documentChunks">;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  audioReferences?: AudioReference[];
  isLoading?: boolean;
}

interface EnhancedChatProps {
  documentId: Id<"documents">;
  sessionId?: Id<"chatSessions">;
  onAudioJump?: (timestamp: number) => void;
  hasAudioContent?: boolean;
}

export function EnhancedChat({ 
  documentId, 
  sessionId,
  onAudioJump,
  hasAudioContent = false
}: EnhancedChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    // Add assistant loading message
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      isLoading: true
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // TODO: Call Convex action for chat response with audio context
      // const response = await mutation({
      //   sessionId,
      //   message: input.trim(),
      //   documentId,
      //   includeAudioContext: hasAudioContent
      // });

      // Simulated response for now
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? {
                  ...msg,
                  content: "This is a simulated response. The actual implementation will use Convex actions to generate responses with audio context references.",
                  isLoading: false,
                  audioReferences: hasAudioContent ? [
                    {
                      timestamp: 45.5,
                      duration: 10,
                      text: "As mentioned in the audio",
                      chunkId: "placeholder" as Id<"documentChunks">
                    }
                  ] : undefined
                }
              : msg
          )
        );
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessage.id));
      setIsProcessing(false);
    }
  };

  // Voice recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        // TODO: Send audio for transcription
        console.log("Audio recorded:", audioBlob);
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Custom markdown components
  const markdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <div className="relative my-4">
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              <Code2 className="h-3 w-3 mr-1" />
              {match[1]}
            </Badge>
          </div>
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            className="rounded-lg !mt-0"
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Start a conversation about this document
              </p>
              {hasAudioContent && (
                <p className="text-sm text-muted-foreground mt-2">
                  Audio timestamps will be included in responses
                </p>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/ai-avatar.png" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                
                <Card className={cn(
                  "max-w-[80%]",
                  message.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                )}>
                  <CardContent className="p-3">
                    {message.isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    ) : (
                      <>
                        <ReactMarkdown
                          remarkPlugins={[remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={markdownComponents}
                          className="prose prose-sm dark:prose-invert max-w-none"
                        >
                          {message.content}
                        </ReactMarkdown>
                        
                        {/* Audio References */}
                        {message.audioReferences && message.audioReferences.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <Separator className="my-2" />
                            <p className="text-xs font-medium flex items-center gap-1">
                              <Volume2 className="h-3 w-3" />
                              Audio References:
                            </p>
                            {message.audioReferences.map((ref, idx) => (
                              <Button
                                key={idx}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-xs"
                                onClick={() => onAudioJump?.(ref.timestamp)}
                              >
                                <Play className="h-3 w-3 mr-2" />
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDuration(ref.timestamp)}
                                <span className="ml-2 truncate">{ref.text}</span>
                              </Button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask about this document..."
              className="min-h-[60px] max-h-[120px] pr-12"
              disabled={isProcessing || isRecording}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-2 right-2"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
            >
              {isRecording ? (
                <MicOff className="h-4 w-4 text-red-500" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isProcessing}
            className="self-end"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        {hasAudioContent && (
          <p className="text-xs text-muted-foreground mt-2">
            Tip: Responses will include timestamps. Click them to jump to that audio position.
          </p>
        )}
      </div>
    </div>
  );
}