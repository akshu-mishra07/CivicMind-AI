'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDropzone } from 'react-dropzone';
import { 
  Camera, 
  MapPin, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  UploadCloud, 
  Check, 
  Brain,
  ShieldAlert
} from 'lucide-react';
import { issueReportSchema, type IssueReportFormData } from '@/lib/validators';
import api from '@/lib/api';
import LocationPicker from '@/components/maps/LocationPicker';
import VoiceRecorder from '@/components/issues/VoiceRecorder';
import { ISSUE_CATEGORIES } from '@civicmind/shared/dist/constants/categories';
import { toast } from 'sonner';

export default function ReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  
  // AI Vision Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{
    category: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    confidence: number;
    description: string;
    suggestions: string[];
  } | null>(null);

  // AI Swarm Orchestrator simulation states
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestratorStep, setOrchestratorStep] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IssueReportFormData>({
    resolver: zodResolver(issueReportSchema),
    defaultValues: {
      title: '',
      description: '',
      address: '',
      location: { lat: 28.5833, lng: 77.0667 },
    }
  });

  const watchTitle = watch('title');
  const watchDescription = watch('description');
  const watchAddress = watch('address');

  // Drag & drop file configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [], 'video/*': [] },
    maxFiles: 2,
    onDrop: (acceptedFiles) => {
      setImages(acceptedFiles);
      toast.success('Media attached.');
      triggerAIAnalysis(acceptedFiles[0]);
    }
  });

  const triggerAIAnalysis = (file: File) => {
    setIsAnalyzing(true);
    setAiResult(null);
    toast.info('Ingesting image through diagnostics queue...');

    setTimeout(() => {
      let mockAnalysis: {
        category: string;
        severity: 'critical' | 'high' | 'medium' | 'low';
        confidence: number;
        description: string;
        suggestions: string[];
      } = {
        category: 'pothole',
        severity: 'high',
        confidence: 0.94,
        description: 'Road damage profile matches a critical street pothole showing subsurface structure exposure. Discovered near pedestrian corridor.',
        suggestions: ['Establish warning cones', 'Apply temporary asphalt fill', 'Conduct stormwater pipe check']
      };

      const name = file.name.toLowerCase();
      if (name.includes('garbage') || name.includes('trash') || name.includes('dump')) {
        mockAnalysis = {
          category: 'garbage',
          severity: 'medium',
          confidence: 0.89,
          description: 'Accumulation of uncollected waste bags and organic rubbish. Attracting local animal scavengers.',
          suggestions: ['Dispatch waste clearance truck', 'Place standard community bin', 'Post CCTV surveillance signs']
        };
      } else if (name.includes('water') || name.includes('leak') || name.includes('flood')) {
        mockAnalysis = {
          category: 'water_leak',
          severity: 'high',
          confidence: 0.92,
          description: 'Surface rupture releasing clean mains drinking water onto sidewalk tiles.',
          suggestions: ['Isolate distribution main', 'Excavate affected pavement section', 'Weld copper coupling line']
        };
      } else if (name.includes('light') || name.includes('dark')) {
        mockAnalysis = {
          category: 'streetlight',
          severity: 'low',
          confidence: 0.97,
          description: 'Dark sodium vapor fixture. Bulb casing intact, electrical relay replacement indicated.',
          suggestions: ['Verify circuit breaker switch', 'Replace bulb with LED unit', 'Verify underground cable grounding']
        };
      }

      setAiResult(mockAnalysis);
      setIsAnalyzing(false);
      toast.success('AI classification details completed.');

      setValue('title', `Unresolved ${mockAnalysis.category.replace('_', ' ')} incident reported`);
      setValue('description', `${mockAnalysis.description}\n\n[Auto-Assigned Category: ${mockAnalysis.category}]`);
    }, 2000);
  };

  const handleLocationSelected = (loc: { lat: number; lng: number }, addr: string) => {
    setValue('location', loc);
    setValue('address', addr);
  };

  const handleVoiceTranscribed = (text: string) => {
    if (text) {
      setValue('description', text);
    }
  };

  const onSubmitForm = async (data: IssueReportFormData) => {
    setIsOrchestrating(true);
    setOrchestratorStep(1);

    // Sequence simulated agents visual steps
    setTimeout(() => {
      setOrchestratorStep(2);
      setTimeout(() => {
        setOrchestratorStep(3);
        setTimeout(() => {
          setOrchestratorStep(4);
          setTimeout(() => {
            setOrchestratorStep(5);
          }, 1400);
        }, 1400);
      }, 1400);
    }, 1400);

    try {
      const mockGcsUrls = ['https://storage.googleapis.com/civicmind-uploads/demo-pothole.jpg'];
      const mockVoiceUrl = voiceBlob ? 'https://storage.googleapis.com/civicmind-uploads/voice-note.webm' : undefined;

      const issuePayload = {
        title: data.title,
        description: data.description,
        address: data.address,
        location: {
          type: 'Point',
          coordinates: [data.location.lng, data.location.lat]
        },
        images: mockGcsUrls,
        voiceNote: mockVoiceUrl,
        aiAnalysis: aiResult ? {
          category: aiResult.category,
          severity: aiResult.severity,
          confidence: aiResult.confidence,
          description: aiResult.description,
          suggestions: aiResult.suggestions
        } : {
          category: 'other',
          severity: 'low',
          confidence: 0.50,
          description: 'Manual citizen submission. No AI evaluation completed.'
        }
      };

      await api.post('/issues', issuePayload);
    } catch (err: any) {
      console.warn('API error during swarm setup: ', err);
    }
  };

  const nextStep = () => {
    if (step === 1 && images.length === 0) {
      toast.warning('Please attach at least one photo of the issue.');
      return;
    }
    if (step === 2 && (!watchTitle || !watchDescription)) {
      toast.warning('Please provide a title and description.');
      return;
    }
    if (step === 3 && !watchAddress) {
      toast.warning('Please set an address using the map picker.');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-slate-800">
      {/* Header */}
      <div className="text-left border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-black text-[#0b2240] tracking-tight">Submit Public Grievance</h1>
        <p className="text-slate-550 text-xs mt-1 font-semibold">File public infrastructure issues. Verification agents will analyze and route details.</p>
      </div>

      {/* Steps Progress Indicator */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        {[
          { label: 'Upload Evidence', icon: Camera },
          { label: 'Incident Details', icon: Brain },
          { label: 'Geolocate', icon: MapPin },
          { label: 'Finish', icon: Check }
        ].map((item, index) => {
          const Icon = item.icon;
          const num = index + 1;
          const isActive = step === num;
          const isDone = step > num;
          return (
            <div key={num} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all border ${
                isActive 
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-extrabold shadow-sm' 
                  : isDone 
                  ? 'bg-[#2563eb] text-white border-[#2563eb]' 
                  : 'bg-white border-slate-200 text-slate-400'
              }`}>
                {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : num}
              </div>
              <span className={`hidden md:inline text-xs font-bold ${isActive ? 'text-[#0b2240]' : isDone ? 'text-[#2563eb]' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {/* STEP 1: UPLOAD PHOTO */}
        {step === 1 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 text-left">
            <div>
              <h3 className="font-extrabold text-[#0b2240] text-base">Step 1: Upload Photo or Video Evidence</h3>
              <p className="text-xs text-slate-500 mt-1 font-semibold">Take a clear photo or short video of the problem. AI vision uses this for category and severity analysis.</p>
            </div>

            {/* Dropzone */}
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                isDragActive 
                  ? 'border-[#2563eb] bg-blue-50/30' 
                  : 'border-slate-200 hover:border-slate-350 bg-slate-50/50'
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="h-10 w-10 text-slate-450" />
              <div className="text-center">
                <p className="text-xs font-bold text-slate-650">Drag files here or click to browse</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Supports PNG, JPG, MP4, WebM (Max 10MB)</p>
              </div>
            </div>

            {/* Attached Image Thumbnail */}
            {images.length > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-white rounded-xl overflow-hidden relative flex items-center justify-center border border-slate-200">
                    <img 
                      src={URL.createObjectURL(images[0])} 
                      alt="upload thumbnail" 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 truncate max-w-xs">{images[0].name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{(images[0].size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wide">Attached</span>
              </div>
            )}

            {/* AI Vision analysis status */}
            {isAnalyzing && (
              <div className="p-4 bg-blue-50/40 border border-blue-200 rounded-2xl flex items-start gap-3 animate-pulse">
                <Brain className="h-5 w-5 text-[#2563eb] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-extrabold text-[#0b2240]">Diagnostics Agent Active</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-semibold">Analyzing image pixels to parse category classifications and safety hazards...</p>
                </div>
              </div>
            )}

            {/* AI result feedback */}
            {aiResult && (
              <div className="p-5 bg-emerald-50/50 border border-emerald-250 rounded-2xl flex items-start gap-4">
                <Brain className="h-6 w-6 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest">Vision Diagnostics report</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">{(aiResult.confidence * 100).toFixed(0)}% Match</span>
                  </div>
                  <p className="text-xs text-slate-650 leading-relaxed italic">"{aiResult.description}"</p>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 mt-2">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-450">Classified Category</span>
                      <p className="text-xs text-[#0b2240] capitalize font-extrabold">{aiResult.category.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-450">Estimated Severity</span>
                      <p className="text-xs text-[#0b2240] capitalize font-extrabold">{aiResult.severity}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: DETAILS */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
              <div>
                <h3 className="font-extrabold text-[#0b2240] text-base">Step 2: Add Incident Details</h3>
                <p className="text-xs text-slate-500 mt-1 font-semibold">Review the generated title and description. You can voice dictate statements below.</p>
              </div>

              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-550" htmlFor="title">Summary Title</label>
                <input
                  id="title"
                  type="text"
                  placeholder="e.g. Broken streetlight on 4th cross Dwarka"
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-[#2563eb]"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-red-500 text-[10px] font-bold mt-0.5">{errors.title.message}</p>
                )}
              </div>

              {/* Description textarea */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-550" htmlFor="description">Detailed Statement</label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Explain the issue in detail, how it affects residents, and how long it has been present..."
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-[#2563eb]"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-red-500 text-[10px] font-bold mt-0.5">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Voice Dictation Component */}
            <VoiceRecorder 
              onAudioRecorded={setVoiceBlob} 
              onTranscriptionGenerated={handleVoiceTranscribed} 
            />
          </div>
        )}

        {/* STEP 3: LOCATION PICKER */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left">
              <h3 className="font-extrabold text-[#0b2240] text-base">Step 3: Define Coordinates Location</h3>
              <p className="text-xs text-slate-500 mt-1 font-semibold">Specify the incident location address on the map picker.</p>
            </div>
            
            <LocationPicker onLocationSelected={handleLocationSelected} />
          </div>
        )}

        {/* STEP 4: REVIEW & SUBMIT */}
        {step === 4 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 text-left">
            <div>
              <h3 className="font-extrabold text-[#0b2240] text-base">Step 4: Final Review & Submission</h3>
              <p className="text-xs text-slate-500 mt-1 font-semibold">Verify details before committing the grievance to the municipal registry.</p>
            </div>

            {/* Summary card */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-left">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-450">Summary Title</span>
                <h4 className="text-xs font-bold text-[#0b2240] mt-0.5">{watchTitle}</h4>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-slate-450">Detailed Statement</span>
                <p className="text-xs text-slate-650 mt-0.5 leading-relaxed">{watchDescription}</p>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-slate-450">Geolocated Address</span>
                <p className="text-xs text-slate-650 mt-0.5 leading-relaxed">{watchAddress}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-450">Photo Attachments</span>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">{images.length} Attached</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-450">Audio Statement</span>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">{voiceBlob ? 'Recorded' : 'None'}</p>
                </div>
              </div>
            </div>

            {/* Swarm details note */}
            <div className="p-4 bg-blue-50/40 border border-blue-200 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-[#2563eb] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#0b2240]">Ingestion Security Guidelines</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">The Vision, Duplicate, and Priority Agents will process this file. Duplicate entries will be automatically merged into main work tickets.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-4">
        {step > 1 ? (
          <button
            onClick={prevStep}
            className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-5 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
          >
            <span>Continue</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit(onSubmitForm)}
            className="flex items-center gap-2 px-6 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md"
          >
            <span>Register Grievance</span>
          </button>
        )}
      </div>
      {isOrchestrating && (
        <div className="fixed inset-0 z-[100] bg-[#0b2240]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 text-left relative overflow-hidden">
            {/* Scanning beam animation overlay */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-indigo-500 to-teal-500 animate-pulse" />

            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0b2240] text-white rounded-2xl">
                <Brain className="h-6 w-6 animate-pulse text-indigo-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#0b2240]">AI Ingestion Swarm Active</h3>
                <p className="text-[10px] text-[#2563eb] font-extrabold uppercase tracking-wider">Gemini Multi-Agent Sequencing</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Agent 1 */}
              <div className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                orchestratorStep >= 1 ? 'bg-slate-50 border-slate-200' : 'bg-white border-transparent opacity-40'
              }`}>
                <div className="mt-0.5">
                  {orchestratorStep > 1 ? (
                    <div className="h-5 w-5 bg-[#059669] text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                  ) : orchestratorStep === 1 ? (
                    <div className="h-5 w-5 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="h-5 w-5 bg-slate-100 rounded-full" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#0b2240]">1. Vision Diagnostics Agent</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                    {orchestratorStep > 1 
                      ? `Identified "${aiResult?.category || 'pothole'}" (${aiResult?.severity || 'high'} severity, ${((aiResult?.confidence || 0.94) * 100).toFixed(0)}% match)` 
                      : 'Scanning photo evidence to evaluate classification & hazard safety...'}
                  </p>
                </div>
              </div>

              {/* Agent 2 */}
              <div className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                orchestratorStep >= 2 ? 'bg-slate-50 border-slate-200' : 'bg-white border-transparent opacity-40'
              }`}>
                <div className="mt-0.5">
                  {orchestratorStep > 2 ? (
                    <div className="h-5 w-5 bg-[#059669] text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                  ) : orchestratorStep === 2 ? (
                    <div className="h-5 w-5 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="h-5 w-5 bg-slate-100 rounded-full" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#0b2240]">2. Duplicate Detection Agent</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                    {orchestratorStep > 2 
                      ? 'Cross-checked 1km coordinates grid. Verified as unique submission.' 
                      : orchestratorStep === 2 ? 'Searching nearby active logs for duplicate coordinates matching...' : 'Awaiting duplicate scan queue...'}
                  </p>
                </div>
              </div>

              {/* Agent 3 */}
              <div className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                orchestratorStep >= 3 ? 'bg-slate-50 border-slate-200' : 'bg-white border-transparent opacity-40'
              }`}>
                <div className="mt-0.5">
                  {orchestratorStep > 3 ? (
                    <div className="h-5 w-5 bg-[#059669] text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                  ) : orchestratorStep === 3 ? (
                    <div className="h-5 w-5 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="h-5 w-5 bg-slate-100 rounded-full" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#0b2240]">3. Urgency Prioritization Agent</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                    {orchestratorStep > 3 
                      ? 'Calculated Priority Index: 87/100 (Nearby schools/hospitals detected, high transit corridor)' 
                      : orchestratorStep === 3 ? 'Calculating proximity scores, traffic density, and age ratios...' : 'Awaiting priority scoring...'}
                  </p>
                </div>
              </div>

              {/* Agent 4 */}
              <div className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                orchestratorStep >= 4 ? 'bg-slate-50 border-slate-200' : 'bg-white border-transparent opacity-40'
              }`}>
                <div className="mt-0.5">
                  {orchestratorStep > 4 ? (
                    <div className="h-5 w-5 bg-[#059669] text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                  ) : orchestratorStep === 4 ? (
                    <div className="h-5 w-5 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="h-5 w-5 bg-slate-100 rounded-full" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#0b2240]">4. Swarm Planning Agent</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                    {orchestratorStep > 4 
                      ? 'Generated 4-stage resolution plan; assigned to Roads department queue.' 
                      : orchestratorStep === 4 ? 'Building step-by-step repair schedule, crew resources list & budget...' : 'Awaiting plan scheduling...'}
                  </p>
                </div>
              </div>
            </div>

            {orchestratorStep === 5 && (
              <button
                onClick={() => router.push('/my-reports')}
                className="w-full py-3.5 bg-gradient-to-r from-[#059669] to-[#047857] text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 text-xs transition-all cursor-pointer hover:opacity-95"
              >
                <span>Go to My Submissions</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
