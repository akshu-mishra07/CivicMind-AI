'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Volume2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceRecorderProps {
  onAudioRecorded: (blob: Blob | null) => void;
  onTranscriptionGenerated?: (text: string) => void;
}

export default function VoiceRecorder({ onAudioRecorded, onTranscriptionGenerated }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if browser supports it
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-IN'; // Indian English support default

        rec.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentTranscript += event.results[i][0].transcript + ' ';
            }
          }
          if (currentTranscript) {
            setTranscriptText((prev) => prev + currentTranscript);
            if (onTranscriptionGenerated) {
              onTranscriptionGenerated(transcriptText + currentTranscript);
            }
          }
        };

        rec.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
        };

        recognitionRef.current = rec;
      }
    }
  }, [onTranscriptionGenerated, transcriptText]);

  // Audio Playback state listener
  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    audioChunksRef.current = [];
    setAudioUrl(null);
    setTranscriptText('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onAudioRecorded(audioBlob);
        
        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      // Start speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setTranscribing(true);
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      console.error('Error opening microphone:', err);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          setTranscribing(false);
        } catch (e) {
          console.error(e);
        }
      }
      toast.success('Voice statement recorded.');
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const deleteRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setDuration(0);
    setTranscriptText('');
    onAudioRecorded(null);
    if (onTranscriptionGenerated) {
      onTranscriptionGenerated('');
    }
    toast.info('Voice statement cleared.');
  };

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden text-left">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-extrabold text-[#0b2240]">Voice Statement Reporting</h4>
          <p className="text-xs text-slate-500 mt-0.5 font-semibold">Describe the issue out loud to auto-generate issue text.</p>
        </div>
        <Volume2 className="h-5 w-5 text-[#2563eb]" />
      </div>

      <div className="flex flex-col items-center justify-center py-6 gap-4">
        {/* Recording Animation Wave */}
        {isRecording && (
          <div className="flex items-center gap-1.5 justify-center h-8 mb-2">
            {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-[#2563eb] to-[#0b2240] rounded-full animate-pulse"
                style={{ 
                  height: `${h * 6}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.8s'
                }}
              />
            ))}
          </div>
        )}

        {/* Action button */}
        {!audioUrl ? (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              type="button"
              className={`h-16 w-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-95 cursor-pointer ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                  : 'bg-[#2563eb] hover:bg-[#1d4ed8] shadow-blue-500/20'
              }`}
            >
              {isRecording ? (
                <Square className="h-6 w-6 text-white fill-current" />
              ) : (
                <Mic className="h-6 w-6 text-white" />
              )}
            </button>
            <span className="text-xs font-mono font-bold text-slate-500">
              {isRecording ? `Recording... [${formatTime(duration)}]` : 'Click to start recording'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full max-w-xs justify-center p-3 bg-[#f8fafc] border border-slate-200 rounded-2xl">
            {/* Play Button */}
            <button
              onClick={playAudio}
              type="button"
              className="h-10 w-10 rounded-xl bg-blue-50 text-[#2563eb] hover:bg-blue-100 flex items-center justify-center transition-all shrink-0 cursor-pointer border border-blue-200"
            >
              {isPlaying ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5 fill-current" />}
            </button>

            {/* Simulated timeline */}
            <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden relative">
              <div 
                className="absolute inset-y-0 left-0 bg-[#2563eb] rounded-full"
                style={{ width: isPlaying ? '100%' : '0%', transition: isPlaying ? `width ${duration}s linear` : 'none' }}
              />
            </div>

            <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0">
              {formatTime(duration)}
            </span>

            {/* Trash button */}
            <button
              onClick={deleteRecording}
              type="button"
              className="h-10 w-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all shrink-0 cursor-pointer border border-red-200"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </button>
          </div>
        )}
      </div>

      {/* Transcription Output Display */}
      {transcriptText && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl animate-in fade-in duration-300">
          <div className="flex items-center gap-2 mb-1.5 text-xs text-[#2563eb] font-bold">
            <Wand2 className="h-3.5 w-3.5" />
            <span>AI Real-time Transcription</span>
          </div>
          <p className="text-xs text-slate-700 italic leading-relaxed font-semibold">
            &quot;{transcriptText}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
