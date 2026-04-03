import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  BrainCircuit, 
  Camera, 
  FileText, 
  LayoutDashboard, 
  MessageSquare, 
  Sparkles,
  Upload,
  ChevronRight,
  Loader2,
  X,
  RefreshCw,
  Link as LinkIcon,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { generateSummary, models, analyzeUrl, generateComprehensiveQuiz, analyzeImage } from './lib/gemini';
import { GoogleGenAI } from "@google/genai";

// --- Translations ---
const translations = {
  en: {
    dashboard: "Dashboard",
    askAi: "Ask AI",
    summarizer: "Summarizer",
    quizGenerator: "Quiz Generator",
    urlAnalysis: "URL Analysis",
    resources: "Resources",
    supportedLanguages: "Supported Languages",
    studentMode: "Student Mode",
    aiReady: "AI Ready",
    masterStudies: "Master Your Studies",
    dashboardSubtitle: "Upload files, paste URLs, or ask anything.",
    studyMaterial: "Study Material",
    studyMaterialSubtitle: "Paste text or describe your topic",
    summarize: "Summarize",
    generateQuiz: "Generate Quiz",
    recentActivity: "Recent Activity",
    noActivity: "No recent activity yet.",
    pasteNotes: "Paste your notes, or ask a question about a specific topic...",
    enterUrl: "Enter URL (YouTube, PDF, or Webpage)",
    analyze: "Analyze",
    askAnything: "Ask Smart Study anything...",
    uploadImage: "Upload Image",
    generateQuizFromTopic: "Generate Quiz from Topic",
    enterTopic: "Enter a topic (e.g., Quantum Physics, World War II)",
    generate: "Generate",
    quizResults: "Quiz Results",
    score: "Score",
    finishAndShowExplanations: "Finish Quiz & Show Explanations",
    explanations: "Explanations",
    correct: "Correct",
    incorrect: "Incorrect",
    suggestedAnswer: "Suggested Answer",
    yourAnswer: "Your Answer",
    matchingInstructions: "Match the items from the left to the right.",
    true: "True",
    false: "False",
    loading: "Loading...",
    thinking: "I'm thinking...",
    resourceTitle: "Academic Resources",
    resourceSubtitle: "Found high-quality resources for your topic",
    viewResource: "View Resource",
    summary: "Summary",
    analysis: "Analysis",
    quiz: "Quiz",
    tutor: "Tutor",
    url: "URL",
    image: "Image",
    justNow: "Just now",
    backToDashboard: "Back to Dashboard",
    analysisResult: "Analysis Result",
    noResult: "No result generated yet.",
    generateQuizFromSummary: "Generate Quiz from this Summary",
    learningResources: "Learning Resources",
    findResources: "Find Resources",
    searchPlaceholder: "Search for resources (e.g., Python for beginners)...",
    relatedResources: "Related Resources",
    explanation: "Explanation",
    needHelp: "Need help with a question?",
    askMeAnything: "Ask me anything about your studies and I'll explain it clearly.",
    startChatting: "Start Chatting",
    smartStudyAi: "Smart Study AI",
    backToDashboardBtn: "← Back to Dashboard",
    uploadContext: "Uploaded context",
    askQuestionOrUpload: "Ask a question or upload a photo...",
    comprehensiveQuiz: "Comprehensive Quiz",
    quizInstructions: "Enter a topic to generate a comprehensive 40-question quiz from scratch.",
    trueFalse: "True / False",
    mcq: "Multiple Choice",
    matching: "Matching",
    fillInBlanks: "Fill in the Blanks",
    shortAnswer: "Short Answer",
    writeAnswerHere: "Write your answer here...",
    suggestedAnswerLabel: "Suggested Answer:",
    matchesWith: "matches with",
  },
  am: {
    dashboard: "ዳሽቦርድ",
    askAi: "AIን ጠይቅ",
    summarizer: "ማጠቃለያ",
    quizGenerator: "የፈተና ፈጣሪ",
    urlAnalysis: "የURL ትንተና",
    resources: "ምንጮች",
    supportedLanguages: "የሚደገፉ ቋንቋዎች",
    studentMode: "የተማሪ ሁነታ",
    aiReady: "AI ዝግጁ ነው",
    masterStudies: "ትምህርትዎን ያሳድጉ",
    dashboardSubtitle: "ፋይሎችን ይስቀሉ፣ URL ይለጥፉ ወይም ማንኛውንም ነገር ይጠይቁ።",
    studyMaterial: "የጥናት ቁሳቁስ",
    studyMaterialSubtitle: "ጽሑፍ ይለጥፉ ወይም ርዕስዎን ያብራሩ",
    summarize: "አጠቃልል",
    generateQuiz: "ፈተና ፍጠር",
    recentActivity: "የቅርብ ጊዜ እንቅስቃሴ",
    noActivity: "ምንም የቅርብ ጊዜ እንቅስቃሴ የለም።",
    pasteNotes: "ማስታወሻዎን ይለጥፉ፣ ወይም ስለ አንድ የተወሰነ ርዕስ ጥያቄ ይጠይቁ...",
    enterUrl: "URL ያስገቡ (YouTube፣ PDF ወይም ድረ-ገጽ)",
    analyze: "ተንትን",
    askAnything: "ለSmart Study ማንኛውንም ነገር ይጠይቁ...",
    uploadImage: "ምስል ስቀል",
    generateQuizFromTopic: "በርዕስ ፈተና ፍጠር",
    enterTopic: "ርዕስ ያስገቡ (ለምሳሌ፡ ኳንተም ፊዚክስ፣ ሁለተኛው የዓለም ጦርነት)",
    generate: "ፍጠር",
    quizResults: "የፈተና ውጤቶች",
    score: "ውጤት",
    finishAndShowExplanations: "ፈተናውን ጨርስ እና ማብራሪያዎችን አሳይ",
    explanations: "ማብራሪያዎች",
    correct: "ትክክል",
    incorrect: "ስህተት",
    suggestedAnswer: "የተጠቆመ መልስ",
    yourAnswer: "የእርስዎ መልስ",
    matchingInstructions: "ከግራ ወደ ቀኝ ያሉትን እቃዎች አዛምድ።",
    true: "እውነት",
    false: "ሐሰት",
    loading: "በመጫን ላይ...",
    thinking: "እያሰብኩ ነው...",
    resourceTitle: "አካዳሚክ ምንጮች",
    resourceSubtitle: "ለርዕስዎ ከፍተኛ ጥራት ያላቸውን ምንጮች አግኝተናል",
    viewResource: "ምንጩን እይ",
    summary: "ማጠቃለያ",
    analysis: "ትንተና",
    quiz: "ፈተና",
    tutor: "አስተማሪ",
    url: "URL",
    image: "ምስል",
    justNow: "አሁን",
    backToDashboard: "ወደ ዳሽቦርድ ተመለስ",
    analysisResult: "የትንተና ውጤት",
    noResult: "እስካሁን ምንም ውጤት አልተገኘም።",
    generateQuizFromSummary: "ከዚህ ማጠቃለያ ፈተና ፍጠር",
    learningResources: "የመማሪያ ምንጮች",
    findResources: "ምንጮችን ፈልግ",
    searchPlaceholder: "ምንጮችን ፈልግ (ለምሳሌ፡ ፓይዘን ለጀማሪዎች)...",
    relatedResources: "ተዛማጅ ምንጮች",
    explanation: "ማብራሪያ",
    needHelp: "በጥያቄ እርዳታ ይፈልጋሉ?",
    askMeAnything: "ስለ ጥናትዎ ማንኛውንም ነገር ይጠይቁኝ እና በግልፅ እገልጽልዎታለሁ።",
    startChatting: "ውይይት ጀምር",
    smartStudyAi: "Smart Study AI",
    backToDashboardBtn: "← ወደ ዳሽቦርድ ተመለስ",
    uploadContext: "የተሰቀለ ይዘት",
    askQuestionOrUpload: "ጥያቄ ይጠይቁ ወይም ፎቶ ይስቀሉ...",
    comprehensiveQuiz: "አጠቃላይ ፈተና",
    quizInstructions: "ከባዶ አጠቃላይ የ40 ጥያቄዎች ፈተና ለመፍጠር ርዕስ ያስገቡ።",
    trueFalse: "እውነት / ሐሰት",
    mcq: "ባለብዙ ምርጫ",
    matching: "ማዛመድ",
    fillInBlanks: "ክፍት ቦታ ሙላ",
    shortAnswer: "አጭር መልስ",
    writeAnswerHere: "መልስዎን እዚህ ይጻፉ...",
    suggestedAnswerLabel: "የተጠቆመ መልስ:",
    matchesWith: "ከ ... ጋር ይዛመዳል",
  }
};

type Language = 'en' | 'am';

// --- Types ---
type View = 'dashboard' | 'summarizer' | 'tutor' | 'quiz' | 'url-analysis' | 'resources';

interface QuizQuestion {
  question: string;
  explanation: string;
}

interface TrueFalseQuestion extends QuizQuestion {
  answer: boolean;
}

interface MCQQuestion extends QuizQuestion {
  options: string[];
  answer: string;
}

interface MatchingQuestion extends QuizQuestion {
  left: string;
  right: string;
}

interface FillInBlankQuestion extends QuizQuestion {
  answer: string;
}

interface ShortAnswerQuestion extends QuizQuestion {
  suggestedAnswer: string;
}

interface Quiz {
  trueFalse: TrueFalseQuestion[];
  mcq: MCQQuestion[];
  matching: MatchingQuestion[];
  fillInBlanks: FillInBlankQuestion[];
  shortAnswer: ShortAnswerQuestion[];
}

interface HistoryItem {
  title: string;
  date: string;
  type: string;
  data: any;
  view: View;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-accent-yellow text-black shadow-lg shadow-accent-yellow/20" 
        : "text-zinc-400 hover:bg-zinc-800 hover:text-accent-yellow"
    )}
  >
    <Icon size={20} className={cn("transition-transform group-hover:scale-110", active ? "text-black" : "text-zinc-500 group-hover:text-accent-yellow")} />
    <span className="font-medium">{label}</span>
    {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-black" />}
  </button>
);

const Card = ({ children, className, title, subtitle, icon: Icon }: { children: React.ReactNode, className?: string, title?: string, subtitle?: string, icon?: any }) => (
  <div className={cn("glass-card rounded-3xl p-6 overflow-hidden relative group", className)}>
    {title && (
      <div className="flex items-center gap-3 mb-6">
        {Icon && (
          <div className="p-2.5 rounded-xl bg-zinc-800 text-accent-yellow group-hover:bg-zinc-700 transition-colors">
            <Icon size={20} />
          </div>
        )}
        <div>
          <h3 className="text-lg font-bold text-accent-yellow">{title}</h3>
          {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
        </div>
      </div>
    )}
    {children}
  </div>
);

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const t = translations[language];

  const [inputText, setInputText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [quizTopic, setQuizTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [resources, setResources] = useState<{ text: string, resources: { title: string, url: string }[] } | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string, resources?: { title: string, url: string }[], image?: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const addToHistory = (title: string, type: string, data: any, view: View) => {
    const newItem: HistoryItem = {
      title: title.length > 30 ? title.substring(0, 30) + "..." : title,
      date: "Just now",
      type,
      data,
      view
    };
    setHistory(prev => [newItem, ...prev].slice(0, 5));
  };

  const handleHistoryClick = (item: HistoryItem) => {
    if (item.view === 'summarizer' || item.view === 'url-analysis') setResult(item.data);
    if (item.view === 'quiz') {
      setQuiz(item.data);
      setQuizAnswers({});
      setShowQuizResults(false);
    }
    if (item.view === 'resources') setResources(item.data);
    setActiveView(item.view);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeView === 'tutor') {
      scrollToBottom();
    }
  }, [messages, activeView]);

  const handleSendMessage = async () => {
    if (!chatInput && !selectedImage) return;
    const userMsg = chatInput;
    const userImg = selectedImage;
    setChatInput('');
    setSelectedImage(null);
    setMessages(prev => [...prev, { role: 'user', text: userMsg || "Analyze this image", image: userImg || undefined }]);
    setLoading(true);
    setError(null);

    try {
      const { getResources, analyzeImage } = await import('./lib/gemini');
      let responseText = "";

      if (userImg) {
        responseText = await analyzeImage(userImg, userMsg || "What is in this image?");
      } else {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = userMsg.match(urlRegex);
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

        if (urls && urls.length > 0) {
          // If a URL is detected, use generateContent with urlContext and googleSearch for better analysis
          const response = await ai.models.generateContent({
            model: models.flash,
            contents: `The user has provided the following URL(s): ${urls.join(', ')}. 
                       Analyze the content of these URL(s) in extreme detail to answer the user's request.
                       User Request: ${userMsg}
                       
                       Instructions:
                       - If any URL is a YouTube video, you MUST fetch and analyze the transcript or video content.
                       - Provide a comprehensive, well-structured response. 
                       - Do not be brief. 
                       - Stay strictly focused on the content of the provided URL(s).
                       - Current UI Language: ${language === 'en' ? 'English' : 'Amharic'}. Respond in this language unless the user asks otherwise.`,
            config: {
              tools: [{ urlContext: {} }, { googleSearch: {} }]
            }
          });
          responseText = response.text || (language === 'en' ? "I've analyzed the content but couldn't find a specific answer." : "ይዘቱን ተንትኛለሁ ግን የተለየ መልስ ማግኘት አልቻልኩም።");
        } else {
          const chat = ai.chats.create({
            model: models.flash,
            config: {
              systemInstruction: `You are Smart Study AI. Your goal is to help students with their academic questions. Be clear, concise, and helpful. Use examples where appropriate. If the user provides a URL, analyze it thoroughly. You support multiple languages including English and Amharic. Current UI Language: ${language === 'en' ? 'English' : 'Amharic'}. Respond in the language the user uses or explicitly requests.`,
            },
          });
          
          const response = await chat.sendMessage({ 
            message: userMsg 
          });
          responseText = response.text || (language === 'en' ? "I'm thinking..." : "እያሰብኩ ነው...");
        }
      }

      let resData = null;
      if (userMsg.toLowerCase().includes('coding') || userMsg.toLowerCase().includes('resource') || userMsg.toLowerCase().includes('learn')) {
        try {
          resData = await getResources(userMsg);
        } catch (e) {
          console.error("Resource fetch failed", e);
        }
      }
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: responseText,
        resources: resData?.resources
      }]);
      addToHistory(userMsg || "Image Analysis", "AI Chat", responseText, "tutor");
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Failed to call Gemini API. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!inputText && !urlInput) return;
    setLoading(true);
    setError(null);
    try {
      const { generateSummary } = await import('./lib/gemini');
      const summary = await generateSummary(inputText, urlInput);
      setResult(summary);
      setActiveView('summarizer');
      addToHistory(urlInput || inputText, t.summary, summary, "summarizer");
    } catch (error: any) {
      console.error(error);
      setError(error.message || (language === 'en' ? "Failed to call Gemini API. Please check your connection." : "የGemini API መጥራት አልተሳካም። እባክዎ ግንኙነትዎን ያረጋግጡ።"));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!inputText && !urlInput && !quizTopic) return;
    setLoading(true);
    setError(null);
    setQuizAnswers({});
    setShowQuizResults(false);
    try {
      let quizData;
      if (quizTopic) {
        const { generateQuizFromTopic } = await import('./lib/gemini');
        quizData = await generateQuizFromTopic(quizTopic);
      } else {
        const { generateComprehensiveQuiz } = await import('./lib/gemini');
        quizData = await generateComprehensiveQuiz(inputText, urlInput);
      }
      setQuiz(quizData);
      setActiveView('quiz');
      addToHistory(quizTopic || urlInput || inputText, t.quiz, quizData, "quiz");
    } catch (error: any) {
      console.error(error);
      setError(error.message || (language === 'en' ? "Failed to call Gemini API. Please check your connection." : "የGemini API መጥራት አልተሳካም። እባክዎ ግንኙነትዎን ያረጋግጡ።"));
    } finally {
      setLoading(false);
    }
  };

  const handleUrlAnalysis = async () => {
    if (!urlInput) return;
    setLoading(true);
    setError(null);
    try {
      const { analyzeUrl } = await import('./lib/gemini');
      const analysis = await analyzeUrl(urlInput, inputText || "Analyze this document in depth.");
      setResult(analysis);
      setActiveView('url-analysis');
      addToHistory(urlInput, t.analysis, analysis, "url-analysis");
    } catch (error: any) {
      console.error(error);
      setError(error.message || (language === 'en' ? "Failed to call Gemini API. Please check your connection." : "የGemini API መጥራት አልተሳካም። እባክዎ ግንኙነትዎን ያረጋግጡ።"));
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetResources = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const { getResources } = await import('./lib/gemini');
      const data = await getResources(query);
      setResources(data);
      setActiveView('resources');
      addToHistory(query, t.resources, data, "resources");
    } catch (error: any) {
      console.error(error);
      setError(error.message || (language === 'en' ? "Failed to call Gemini API. Please check your connection." : "የGemini API መጥራት አልተሳካም። እባክዎ ግንኙነትዎን ያረጋግጡ።"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white font-sans">
      {/* Sidebar */}
      <aside className="w-72 border-r border-zinc-800 bg-zinc-950 p-6 flex flex-col gap-8 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-accent-yellow flex items-center justify-center text-black shadow-xl shadow-accent-yellow/20">
            <BrainCircuit size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-accent-yellow">Smart Study</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <SidebarItem icon={LayoutDashboard} label={t.dashboard} active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <SidebarItem icon={MessageSquare} label={t.askAi} active={activeView === 'tutor'} onClick={() => setActiveView('tutor')} />
          <SidebarItem icon={FileText} label={t.summarizer} active={activeView === 'summarizer'} onClick={() => setActiveView('summarizer')} />
          <SidebarItem icon={HelpCircle} label={t.quizGenerator} active={activeView === 'quiz'} onClick={() => setActiveView('quiz')} />
          <SidebarItem icon={LinkIcon} label={t.urlAnalysis} active={activeView === 'url-analysis'} onClick={() => setActiveView('url-analysis')} />
          <SidebarItem icon={Sparkles} label={t.resources} active={activeView === 'resources'} onClick={() => setActiveView('resources')} />
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">{t.supportedLanguages}</p>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setLanguage('en')}
                className={cn(
                  "px-2 py-1 rounded-md text-[10px] font-medium border transition-all",
                  language === 'en' 
                    ? "bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20" 
                    : "bg-zinc-800 text-zinc-400 border-zinc-700/50 hover:border-zinc-500"
                )}
              >
                English
              </button>
              <button 
                onClick={() => setLanguage('am')}
                className={cn(
                  "px-2 py-1 rounded-md text-[10px] font-medium border transition-all",
                  language === 'am' 
                    ? "bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20" 
                    : "bg-zinc-800 text-zinc-400 border-zinc-700/50 hover:border-zinc-500"
                )}
              >
                አማርኛ (Amharic)
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">{t.studentMode}</p>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <div className="w-2 h-2 rounded-full bg-accent-yellow animate-pulse" />
              {t.aiReady}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto space-y-10"
            >
              <header>
                <h2 className="text-4xl font-bold text-accent-yellow mb-2">{t.masterStudies}</h2>
                <p className="text-zinc-400 text-lg">{t.dashboardSubtitle}</p>
                {error && (
                  <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                    <X size={18} />
                    {error}
                  </div>
                )}
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card 
                  title={t.studyMaterial} 
                  subtitle={t.studyMaterialSubtitle}
                  icon={FileText}
                  className="md:col-span-2"
                >
                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={t.pasteNotes}
                    className="w-full h-48 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 focus:ring-2 focus:ring-accent-yellow focus:border-transparent transition-all resize-none outline-none text-zinc-300"
                  />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button 
                      onClick={handleSummarize}
                      disabled={loading || !inputText}
                      className="flex-1 bg-accent-yellow text-black py-3 rounded-xl font-bold hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                      {t.summarize}
                    </button>
                    <button 
                      onClick={handleGenerateQuiz}
                      disabled={loading || (!inputText && !urlInput)}
                      className="flex-1 bg-zinc-800 text-accent-yellow py-3 rounded-xl font-bold hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <HelpCircle size={18} />}
                      {t.generateQuiz}
                    </button>
                  </div>
                </Card>

                <Card 
                  title={t.urlAnalysis} 
                  subtitle={t.enterUrl}
                  icon={LinkIcon}
                >
                  <div className="space-y-4">
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                      <input 
                        type="text" 
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder={t.enterUrl}
                        className="w-full p-3 pl-10 rounded-xl bg-zinc-950 border border-zinc-800 focus:ring-2 focus:ring-accent-yellow outline-none transition-all text-sm"
                      />
                    </div>
                    <p className="text-xs text-zinc-500 italic">Note: Provide context in the main text area above for better analysis.</p>
                    <button 
                      onClick={handleUrlAnalysis}
                      disabled={loading || !urlInput || !inputText}
                      className="w-full bg-zinc-100 text-black py-3 rounded-xl font-bold hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                      {t.analyze}
                    </button>
                    
                    <div className="pt-4 border-t border-zinc-800">
                      <p className="text-sm font-bold text-accent-yellow mb-2">Or Upload File</p>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-4 rounded-xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center gap-2 hover:border-accent-yellow hover:bg-zinc-900 transition-all cursor-pointer group"
                      >
                        <Upload className="text-zinc-500 group-hover:text-accent-yellow" size={24} />
                        <span className="text-xs text-zinc-500">Click to upload PDF/Image</span>
                      </div>
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title={t.recentActivity} icon={BookOpen}>
                  <div className="space-y-4">
                    {history.length > 0 ? history.map((item, i) => (
                      <div 
                        key={i} 
                        onClick={() => handleHistoryClick(item)}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-accent-yellow">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-200">{item.title}</p>
                            <p className="text-xs text-zinc-500">{item.date === "Just now" ? t.justNow : item.date} • {item.type}</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-zinc-600" />
                      </div>
                    )) : (
                      <div className="h-32 flex flex-col items-center justify-center text-zinc-500 text-sm italic">
                        {t.noActivity}
                      </div>
                    )}
                  </div>
                </Card>

                <Card title={t.askAi} icon={MessageSquare}>
                  <div className="h-48 flex flex-col items-center justify-center text-center gap-4">
                    <div className="p-4 rounded-full bg-zinc-900 text-accent-yellow">
                      <Sparkles size={32} />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-200">{t.needHelp}</p>
                      <p className="text-sm text-zinc-500 max-w-[250px] mx-auto">{t.askMeAnything}</p>
                    </div>
                    <button 
                      onClick={() => setActiveView('tutor')}
                      className="text-accent-yellow font-bold text-sm hover:underline"
                    >
                      {t.startChatting} →
                    </button>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeView === 'tutor' && (
            <motion.div
              key="tutor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setActiveView('dashboard')} className="text-zinc-500 hover:text-accent-yellow flex items-center gap-2 font-medium">
                  {t.backToDashboardBtn}
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 text-accent-yellow text-sm font-bold">
                  <Sparkles size={16} />
                  {t.smartStudyAi}
                </div>
              </div>

              <Card className="flex-1 flex flex-col p-0 overflow-hidden bg-zinc-950 border-zinc-800">
                <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-zinc-950/50">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-accent-yellow flex items-center justify-center text-black shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-2xl rounded-tl-none border border-zinc-800 max-w-[80%]">
                      <p className="text-zinc-200">{language === 'en' ? "Hello! I'm Smart Study AI. How can I help you with your studies today?" : "ሰላም! እኔ Smart Study AI ነኝ። ዛሬ በጥናትዎ እንዴት ልረዳዎት እችላለሁ?"}</p>
                    </div>
                  </div>
                  
                  {messages.map((msg, i) => (
                    <div key={i} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "")}>
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        msg.role === 'user' ? "bg-zinc-100 text-black" : "bg-accent-yellow text-black"
                      )}>
                        {msg.role === 'user' ? <LayoutDashboard size={16} /> : <Sparkles size={16} />}
                      </div>
                      <div className={cn(
                        "p-4 rounded-2xl border max-w-[80%]",
                        msg.role === 'user' ? "bg-zinc-800 text-white border-zinc-700 rounded-tr-none" : "bg-zinc-900 text-zinc-200 border-zinc-800 rounded-tl-none"
                      )}>
                        {msg.image && (
                          <img src={msg.image} alt={t.uploadContext} className="max-w-full h-auto rounded-xl mb-3 border border-zinc-700" />
                        )}
                        <div className="markdown-body prose prose-invert prose-sm">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                        {msg.resources && (
                          <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
                            <p className="text-xs font-bold text-accent-yellow uppercase tracking-wider">{t.relatedResources}:</p>
                            <div className="flex flex-wrap gap-2">
                              {msg.resources.map((res, j) => (
                                <a 
                                  key={j} 
                                  href={res.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-700 flex items-center gap-1.5 transition-all"
                                >
                                  <LinkIcon size={12} />
                                  {res.title}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-4 animate-pulse">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 shrink-0" />
                      <div className="bg-zinc-900 p-4 rounded-2xl rounded-tl-none border border-zinc-800 w-24 h-10" />
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-4 bg-zinc-950 border-t border-zinc-800">
                  {selectedImage && (
                    <div className="mb-4 relative inline-block">
                      <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-accent-yellow" />
                      <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                    className="relative flex gap-2"
                  >
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-accent-yellow transition-all"
                    >
                      <Camera size={20} />
                    </button>
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={t.askQuestionOrUpload}
                        className="w-full p-4 pr-12 rounded-2xl bg-zinc-900 border border-zinc-800 focus:ring-2 focus:ring-accent-yellow focus:border-transparent outline-none transition-all text-white"
                      />
                      <button 
                        type="submit"
                        disabled={loading || (!chatInput && !selectedImage)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-accent-yellow text-black hover:bg-yellow-400 transition-all disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <ChevronRight size={20} />}
                      </button>
                    </div>
                  </form>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                </div>
              </Card>
            </motion.div>
          )}

          {activeView === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto space-y-8 pb-20"
            >
              <div className="flex items-center justify-between">
                <button onClick={() => setActiveView('dashboard')} className="text-zinc-500 hover:text-accent-yellow flex items-center gap-2 font-medium">
                  {t.backToDashboardBtn}
                </button>
                <h2 className="text-2xl font-bold text-accent-yellow">{t.comprehensiveQuiz}</h2>
              </div>

              {!quiz && (
                <Card title={t.generateQuizFromTopic} icon={HelpCircle} className="max-w-xl mx-auto">
                  <div className="space-y-4">
                    <p className="text-zinc-400 text-sm">{t.quizInstructions}</p>
                    <input 
                      type="text" 
                      value={quizTopic}
                      onChange={(e) => setQuizTopic(e.target.value)}
                      placeholder={t.enterTopic}
                      className="w-full p-4 rounded-2xl bg-zinc-950 border border-zinc-800 focus:ring-2 focus:ring-accent-yellow outline-none transition-all text-white"
                    />
                    <button 
                      onClick={handleGenerateQuiz}
                      disabled={loading || !quizTopic}
                      className="w-full bg-accent-yellow text-black py-4 rounded-2xl font-bold hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                      {t.generate}
                    </button>
                  </div>
                </Card>
              )}

              {quiz && (
                <div className="space-y-12">
                  {/* True/False */}
                  <section className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2"><CheckCircle2 className="text-accent-yellow" /> {t.trueFalse}</h3>
                    <div className="grid gap-4">
                      {quiz.trueFalse.map((q, i) => {
                        const key = `tf-${i}`;
                        const selected = quizAnswers[key];
                        const isCorrect = selected === q.answer;
                        return (
                          <Card key={i} className="p-4">
                            <p className="font-medium text-zinc-200 mb-4">{q.question}</p>
                            <div className="flex gap-4">
                              {[true, false].map((val) => (
                                <button 
                                  key={val.toString()}
                                  onClick={() => !showQuizResults && setQuizAnswers(prev => ({ ...prev, [key]: val }))}
                                  className={cn(
                                    "px-6 py-2 rounded-lg border transition-all text-sm font-bold",
                                    selected === val 
                                      ? (val === q.answer ? "bg-green-500 border-green-500 text-white" : "bg-red-500 border-red-500 text-white")
                                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-accent-yellow"
                                  )}
                                >
                                  {val ? t.true : t.false}
                                </button>
                              ))}
                            </div>
                            {showQuizResults && (
                              <div className="mt-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-400">
                                <span className="text-accent-yellow font-bold">{t.explanation}:</span> {q.explanation}
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  </section>

                  {/* MCQ */}
                  <section className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2"><HelpCircle className="text-accent-yellow" /> {t.mcq}</h3>
                    <div className="grid gap-4">
                      {quiz.mcq.map((q, i) => {
                        const key = `mcq-${i}`;
                        const selected = quizAnswers[key];
                        return (
                          <Card key={i} className="p-4">
                            <p className="font-medium text-zinc-200 mb-4">{q.question}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {q.options.map((opt, j) => (
                                <button 
                                  key={j} 
                                  onClick={() => !showQuizResults && setQuizAnswers(prev => ({ ...prev, [key]: opt }))}
                                  className={cn(
                                    "p-4 text-left rounded-xl border transition-all text-sm font-medium",
                                    selected === opt 
                                      ? (opt === q.answer ? "bg-green-500 border-green-500 text-white" : "bg-red-500 border-red-500 text-white")
                                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-accent-yellow"
                                  )}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                            {showQuizResults && (
                              <div className="mt-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-400">
                                <span className="text-accent-yellow font-bold">{t.explanation}:</span> {q.explanation}
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  </section>

                  {/* Matching */}
                  <section className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2"><RefreshCw className="text-accent-yellow" /> {t.matching}</h3>
                    <Card className="p-6">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                          {quiz.matching.map((m, i) => (
                            <div key={i} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300">{m.left}</div>
                          ))}
                        </div>
                        <div className="space-y-3">
                          {quiz.matching.map((m, i) => (
                            <div key={i} className="p-4 rounded-xl bg-zinc-900 border border-accent-yellow/30 text-sm font-medium text-accent-yellow">{m.right}</div>
                          ))}
                        </div>
                      </div>
                      {showQuizResults && (
                        <div className="mt-6 space-y-2">
                          {quiz.matching.map((m, i) => (
                            <div key={i} className="text-xs text-zinc-500 italic">
                              <span className="text-accent-yellow font-bold">{m.left}</span> {t.matchesWith} <span className="text-accent-yellow font-bold">{m.right}</span>. {m.explanation}
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </section>

                  {/* Fill in Blanks */}
                  <section className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2"><FileText className="text-accent-yellow" /> {t.fillInBlanks}</h3>
                    <div className="grid gap-4">
                      {quiz.fillInBlanks.map((q, i) => {
                        const key = `fib-${i}`;
                        const val = quizAnswers[key] || '';
                        return (
                          <Card key={i} className="p-4">
                            <p className="font-medium text-zinc-200 mb-4">{q.question}</p>
                            <div className="flex gap-3">
                              <input 
                                type="text" 
                                value={val}
                                onChange={(e) => !showQuizResults && setQuizAnswers(prev => ({ ...prev, [key]: e.target.value }))}
                                placeholder={language === 'en' ? "Your answer..." : "የእርስዎ መልስ..."} 
                                className={cn(
                                  "flex-1 p-3 rounded-xl bg-zinc-950 border outline-none transition-all text-sm",
                                  showQuizResults 
                                    ? (val.toLowerCase().trim() === q.answer.toLowerCase().trim() ? "border-green-500 text-green-400" : "border-red-500 text-red-400")
                                    : "border-zinc-800 focus:border-accent-yellow text-zinc-300"
                                )}
                              />
                              {showQuizResults && (
                                <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-bold">
                                  {language === 'en' ? "Correct:" : "ትክክል:"} {q.answer}
                                </div>
                              )}
                            </div>
                            {showQuizResults && (
                              <div className="mt-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-400">
                                <span className="text-accent-yellow font-bold">{t.explanation}:</span> {q.explanation}
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  </section>

                  {/* Short Answer */}
                  <section className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2"><MessageSquare className="text-accent-yellow" /> {t.shortAnswer}</h3>
                    <div className="grid gap-4">
                      {quiz.shortAnswer.map((q, i) => {
                        const key = `sa-${i}`;
                        const val = quizAnswers[key] || '';
                        return (
                          <Card key={i} className="p-4">
                            <p className="font-medium text-zinc-200 mb-4">{q.question}</p>
                            <textarea 
                              value={val}
                              onChange={(e) => !showQuizResults && setQuizAnswers(prev => ({ ...prev, [key]: e.target.value }))}
                              placeholder={t.writeAnswerHere} 
                              className="w-full h-24 p-4 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-accent-yellow outline-none text-sm resize-none text-zinc-300" 
                            />
                            {showQuizResults && (
                              <div className="mt-4 space-y-3">
                                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                                  <p className="text-xs font-bold text-green-500 uppercase mb-1">{t.suggestedAnswerLabel}</p>
                                  <p className="text-sm text-zinc-300">{q.suggestedAnswer}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-400">
                                  <span className="text-accent-yellow font-bold">{t.explanation}:</span> {q.explanation}
                                </div>
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  </section>

                  <div className="flex justify-center pt-10">
                    {!showQuizResults ? (
                      <button 
                        onClick={() => {
                          setShowQuizResults(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="bg-accent-yellow text-black px-12 py-4 rounded-2xl font-bold text-lg hover:bg-yellow-400 transition-all shadow-xl shadow-accent-yellow/20"
                      >
                        {t.finishAndShowExplanations}
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setQuiz(null);
                          setQuizAnswers({});
                          setShowQuizResults(false);
                          setActiveView('dashboard');
                        }}
                        className="bg-zinc-800 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:bg-zinc-700 transition-all"
                      >
                        {language === 'en' ? "Back to Dashboard" : "ወደ ዳሽቦርድ ተመለስ"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {(activeView === 'summarizer' || activeView === 'url-analysis') && (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setActiveView('dashboard')} className="text-zinc-500 hover:text-accent-yellow flex items-center gap-2 font-medium">
                  {t.backToDashboardBtn}
                </button>
                <h2 className="text-2xl font-bold text-accent-yellow">{t.analysisResult}</h2>
              </div>

              <Card className="p-10">
                <div className="markdown-body prose prose-invert max-w-none">
                  <ReactMarkdown>{result || t.noResult}</ReactMarkdown>
                </div>
                {activeView === 'summarizer' && result && (
                  <div className="mt-8 pt-8 border-t border-zinc-800 flex justify-center">
                    <button 
                      onClick={() => {
                        setInputText(result);
                        handleGenerateQuiz();
                      }}
                      className="bg-accent-yellow text-black px-8 py-4 rounded-2xl font-bold hover:bg-yellow-400 transition-all flex items-center gap-2"
                    >
                      <HelpCircle size={20} />
                      {t.generateQuizFromSummary}
                    </button>
                  </div>
                )}
              </Card>
            </motion.div>
          )}


          {activeView === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="flex items-center justify-between">
                <button onClick={() => setActiveView('dashboard')} className="text-zinc-500 hover:text-accent-yellow flex items-center gap-2 font-medium">
                  {t.backToDashboardBtn}
                </button>
                <h2 className="text-2xl font-bold text-accent-yellow">{t.learningResources}</h2>
              </div>

              <Card title={t.findResources} icon={Sparkles}>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder={t.searchPlaceholder}
                    className="flex-1 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 focus:ring-2 focus:ring-accent-yellow outline-none transition-all text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleGetResources(e.currentTarget.value);
                    }}
                  />
                </div>
              </Card>

              {resources && (
                <div className="space-y-6">
                  <Card className="p-8">
                    <div className="markdown-body prose prose-invert max-w-none">
                      <ReactMarkdown>{resources.text}</ReactMarkdown>
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resources.resources.map((res, i) => (
                      <a 
                        key={i} 
                        href={res.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-accent-yellow hover:bg-zinc-800 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-accent-yellow group-hover:bg-accent-yellow group-hover:text-black transition-all">
                              <LinkIcon size={20} />
                            </div>
                            <span className="font-bold text-zinc-200">{res.title}</span>
                          </div>
                          <ChevronRight size={18} className="text-zinc-600 group-hover:text-accent-yellow" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

