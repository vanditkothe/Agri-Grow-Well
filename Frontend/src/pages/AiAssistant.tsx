import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff, Bot, User, Loader2, Volume2, VolumeX, Pause } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AiAssistant = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "**Hello! 👋 I'm your Agri-Health AI Assistant.**\n\nI can help you with:\n\n🏥 **Health Questions** - Symptoms, first aid, medical advice\n🌾 **Farming Guidance** - Crop diseases, pest management\n🌱 **Soil Health** - Analysis and recommendations\n🍎 **Nutrition** - Diet plans and food safety\n\nHow can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingIndex, setCurrentSpeakingIndex] = useState<number | null>(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {      
    document.title = "AI Assistant - Agri-Health AI Assistant";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Chat with our AI Assistant for health advice, farming guidance, crop disease help, and nutrition tips. 24/7 support for farmers and rural communities.'
      );
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      // Cleanup
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      const aiMessage = {
        role: "assistant",
        content: data.reply || "Sorry, I couldn't process your request right now.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const aiMessage = {
        role: "assistant",
        content: "⚠️ Unable to connect to AI server. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        alert("Could not start voice input. Please try again.");
      }
    }
  };

  // Text-to-Speech function
  const speakMessage = (text: string, messageIndex: number) => {
    if (!synthRef.current) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }

    // Stop any ongoing speech
    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingIndex(null);
      return;
    }

    // Clean the text from markdown formatting
    const cleanText = text
      .replace(/[#*_~`]/g, '') // Remove markdown symbols
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links but keep text
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images
      .replace(/^[-•]\s+/gm, '') // Remove bullet points
      .replace(/^\d+\.\s+/gm, '') // Remove numbered lists
      .replace(/\n{2,}/g, '. ') // Replace multiple newlines with period
      .replace(/\n/g, ' ') // Replace single newlines with space
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Configure voice settings
    utterance.rate = 0.9; // Slightly slower for better understanding
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to use a female voice if available (more pleasant for assistance)
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSpeakingIndex(messageIndex);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeakingIndex(null);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setCurrentSpeakingIndex(null);
    };

    synthRef.current.speak(utterance);
  };

  // Stop speaking function
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingIndex(null);
    }
  };

  const suggestedQuestions = [
    "I have a fever and headache, what should I do?",
    "How to detect wheat rust disease?",
    "Suggest a diet plan for diabetes",
    "What fertilizer is best for paddy crops?",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-6">
        <div className="container mx-auto px-4 h-[calc(100vh-7rem)]">
          <div className="max-w-5xl mx-auto h-full flex flex-col">
            
            {/* Header */}
            <div className="py-6 border-b">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-primary rounded-lg">
                  <Bot className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    AI Chat Assistant
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    24/7 Support for Health & Farming Questions
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto py-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-gradient-primary text-primary-foreground"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Bot className="h-5 w-5" />
                    )}
                  </div>

                  {/* Message Content */}
                  <Card
                    className={`max-w-[80%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border-2"
                    }`}
                  >
                    <CardContent className="p-4">
                      {/* Speaker button for AI messages */}
                      {message.role === "assistant" && (
                        <div className="flex justify-end mb-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => 
                              currentSpeakingIndex === index 
                                ? stopSpeaking() 
                                : speakMessage(message.content, index)
                            }
                            className="h-8 gap-2 hover:bg-primary/10"
                            disabled={isSpeaking && currentSpeakingIndex !== index}
                          >
                            {currentSpeakingIndex === index ? (
                              <>
                                <VolumeX className="h-4 w-4" />
                                <span className="text-xs">Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="h-4 w-4" />
                                <span className="text-xs">Listen</span>
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                      
                      <div
                        className={`prose prose-sm sm:prose-base max-w-none ${
                          message.role === "user" 
                            ? "prose-invert" 
                            : "prose-slate dark:prose-invert"
                        }`}
                        style={{
                          lineHeight: "1.7",
                        }}
                      >
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Custom styling for markdown elements
                            h2: ({node, ...props}) => (
                              <h2 className="text-lg font-bold mt-4 mb-2 flex items-center gap-2 text-primary" {...props} />
                            ),
                            h3: ({node, ...props}) => (
                              <h3 className="text-base font-semibold mt-3 mb-2 text-primary" {...props} />
                            ),
                            ul: ({node, ...props}) => (
                              <ul className="my-2 space-y-1" {...props} />
                            ),
                            ol: ({node, ...props}) => (
                              <ol className="my-2 space-y-2" {...props} />
                            ),
                            li: ({node, ...props}) => (
                              <li className="leading-relaxed" {...props} />
                            ),
                            p: ({node, ...props}) => (
                              <p className="my-2 leading-relaxed" {...props} />
                            ),
                            strong: ({node, ...props}) => (
                              <strong className="font-semibold text-primary" {...props} />
                            ),
                            code: ({node, inline, ...props}) => 
                              inline ? (
                                <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props} />
                              ) : (
                                <code className="block bg-muted p-3 rounded-lg my-2 text-sm" {...props} />
                              ),
                            hr: ({node, ...props}) => (
                              <hr className="my-4 border-t-2 border-border" {...props} />
                            ),
                            blockquote: ({node, ...props}) => (
                              <blockquote className="border-l-4 border-primary pl-4 italic my-3 text-muted-foreground" {...props} />
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>

                      <p
                        className={`text-xs mt-3 pt-2 border-t ${
                          message.role === "user"
                            ? "text-primary-foreground/70 border-primary-foreground/20"
                            : "text-muted-foreground border-border"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground">
                    <Bot className="h-5 w-5" />
                  </div>
                  <Card className="bg-card border-2">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">
                          AI is analyzing your question...
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions (shown when no messages) */}
            {messages.length === 1 && (
              <div className="pb-4">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  💡 Try asking:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start text-left h-auto py-3 px-4 hover:bg-primary/10 hover:border-primary transition-all"
                      onClick={() => setInput(question)}
                    >
                      <span className="text-sm line-clamp-2">{question}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t pt-4 bg-background">
              {/* Voice listening indicator */}
              {isListening && (
                <div className="mb-3 flex items-center gap-2 text-sm text-primary animate-pulse">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                  <span className="font-medium">Listening... Speak now</span>
                </div>
              )}
              
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your health or farming question here..."
                  className="min-h-[60px] max-h-[120px] resize-none focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    size="icon"
                    variant={isListening ? "default" : "outline"}
                    onClick={toggleVoiceInput}
                    disabled={isLoading}
                    className={`hover:scale-105 transition-transform ${
                      isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : ""
                    }`}
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    {isListening ? (
                      <MicOff className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="hover:scale-105 transition-transform"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                <span>⚠️</span>
                <span>This AI assistant provides general guidance. Always consult professionals for medical emergencies. 🎤 Voice features work best in Chrome/Edge browsers.</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AiAssistant;