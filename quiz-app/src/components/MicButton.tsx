import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (text: string) => void;
  disabled?: boolean;
}

type RecInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognizer(): (new () => RecInstance) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => RecInstance;
    webkitSpeechRecognition?: new () => RecInstance;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

/**
 * Mic button for open answers (browser Web Speech API, free, no key).
 * Each tap records one utterance and appends it to the answer.
 * Hidden on browsers without speech support.
 */
export default function MicButton({ value, onChange, disabled }: Props) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => getRecognizer() !== null);
  const recRef = useRef<RecInstance | null>(null);
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    return () => {
      try {
        recRef.current?.stop();
      } catch {
        // ignore cleanup errors
      }
    };
  }, []);

  if (!supported) return null;

  const toggle = () => {
    if (disabled) return;
    if (listening) {
      try {
        recRef.current?.stop();
      } finally {
        setListening(false);
      }
      return;
    }
    const Ctor = getRecognizer();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-IN";
    rec.onresult = (e) => {
      let extra = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) extra += e.results[i][0].transcript;
      }
      if (extra.trim()) {
        const base = valueRef.current.trim();
        onChange(base ? `${base} ${extra.trim()}` : extra.trim());
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={disabled}
      title="Speak your answer (Chrome recommended)"
      className={`mt-2 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition disabled:opacity-40 ${
        listening
          ? "border-rose-600 bg-rose-950 text-rose-200"
          : "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
      }`}
    >
      <span className={listening ? "animate-pulse" : ""}>
        {listening ? "🔴 Listening… tap to stop" : "🎤 Speak answer"}
      </span>
    </button>
  );
}
