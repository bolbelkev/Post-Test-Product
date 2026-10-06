import { FeedbackScreen } from './components/FeedbackScreen.tsx';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { ProgressBar } from './components/ProgressBar.tsx';
import { QuestionCard } from './components/QuestionCard.tsx';
import { Part1Confirmation } from './components/Part1Confirmation.tsx';
import { InterstitialAlumni } from './components/InterstitialAlumni.tsx';
import { ProcessingScreen } from './components/ProcessingScreen.tsx';
import { LeadForm } from './components/LeadForm.tsx';
import { ResultScreen } from './components/ResultScreen.tsx';
import { PrivacyModal } from './components/PrivacyModal.tsx';
import { RecapIntro } from './components/RecapIntro.tsx';
import { RecapProcessing } from './components/RecapProcessing.tsx';
import { RecapMiniResult } from './components/RecapMiniResult.tsx';
import { RECAP_QUESTIONS } from './data/recapQuestions.ts';
import { QuizAnswers, UserContact, SubmissionRecord, FunnelTracking } from './types.ts';
import {
  calculateMatchScore,
  getGoalNarrative,
  getHambatanText,
} from './utils/scoring.ts';
import {
  getAllSubmissions,
  getFunnelStats,
  saveSubmission,
  markCtaClicked,
  trackFunnelStep,
} from './utils/storage.ts';
import {
  CheckCircle,
  Clock,
  Award,
  ArrowRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';

type StepId =
  | 'welcome'
  | 'feedback_ratings'
  | 'feedback_duration'
  | 'feedback_text'
  // Part 1: Profiling
  | 'p1_q1'
  | 'p1_q2'
  | 'p1_q3'
  | 'p1_q4'
  | 'p1_confirm'
  // Part 2: Recap Materi
  | 'recap_intro'
  | 'recap_q1'
  | 'recap_q2'
  | 'recap_q3'
  | 'recap_q4'
  | 'recap_q5'
  | 'recap_q6'
  | 'recap_q7'
  | 'recap_q8'
  | 'recap_q9'
  | 'recap_q10'
  | 'recap_processing'
  | 'recap_mini_result'
  // Part 3 (formerly Part 2): Belief Priming & Level Check
  | 'p2_q1'
  | 'p2_q2'
  | 'p2_q3'
  | 'p2_q4'
  | 'p2_q5'
  | 'p2_interstitial'
  // Part 4 (formerly Part 3): Gaya Belajar
  | 'p3_q1'
  | 'p3_q2'
  | 'p3_q3'
  | 'p3_q4'
  // Part 5 (formerly Part 4): Processing, Data Diri, Hasil
  | 'processing'
  | 'lead_form'
  | 'result';

export default function App() {
  const [currentStep, setCurrentStep] = useState<StepId>('welcome');
  const [goalOther, setGoalOther] = useState(false);
  const [certificateName, setCertificateName] = useState('');
  const [history, setHistory] = useState<StepId[]>([]);
  const [answers, setAnswers] = useState<QuizAnswers>({
    feedback: { clarity: 4, expectations: 4, interaction: 4 },
  });
  const [recapAnswers, setRecapAnswers] = useState<Record<number, string>>({});
  const [recapCorrectCount, setRecapCorrectCount] = useState<number>(0);
  const [currentSubmission, setCurrentSubmission] = useState<SubmissionRecord | null>(null);

  // Privacy Modal
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [funnel, setFunnel] = useState<FunnelTracking>(getFunnelStats());

  useEffect(() => {
    setSubmissions(getAllSubmissions());
    setFunnel(getFunnelStats());
  }, []);

  const refreshData = () => {
    setSubmissions(getAllSubmissions());
    setFunnel(getFunnelStats());
  };

  const goToStep = (nextStep: StepId, pushToHistory = true) => {
    if (pushToHistory) {
      setHistory((prev) => [...prev, currentStep]);
    }
    setCurrentStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (history.length === 0) return;
    const prevStep = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setCurrentStep(prevStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Skip logic check helper
  const handleNextFromP2Q3 = () => {
    if (answers.p1_pernah_iklan === 'Belum') {
      // PRD: Jika Part 1 #1 = "Belum", Part 2 #4 (tools) di-skip dan otomatis bernilai "Belum pernah satupun"
      setAnswers((prev) => ({
        ...prev,
        p2_tools: ['Belum pernah satupun'],
      }));
      goToStep('p2_q5');
    } else {
      goToStep('p2_q4');
    }
  };

  // Start Quiz
  const handleStart = () => {
    if (certificateName.trim().length < 3) return;
    trackFunnelStep('totalStarted');
    refreshData();
    goToStep('p1_q1');
  };

  // Part 1 selection handlers
  const handleSelectP1Q1 = (val: 'Sudah' | 'Belum') => {
    setAnswers((prev) => ({ ...prev, p1_pernah_iklan: val }));
    setTimeout(() => goToStep('p1_q2'), 180);
  };

  const handleSelectP1Q2 = (val: '19-23' | '24-29' | '30-35' | '>35') => {
    setAnswers((prev) => ({ ...prev, p1_usia: val }));
    setTimeout(() => goToStep('p1_q3'), 180);
  };

  const handleSelectP1Q3 = (
    val: 'Pekerja kantoran' | 'Freelance' | 'Pemilik bisnis' | 'Fresh graduate'
  ) => {
    setAnswers((prev) => ({ ...prev, p1_pekerjaan: val }));
    setTimeout(() => goToStep('p1_q4'), 180);
  };

  const handleSelectP1Q4 = (
    val:
      | 'Cari pekerjaan pertama'
      | 'Bikin bisnis'
      | 'Switch career'
      | 'Upskill untuk kebutuhan kerjaan'
  ) => {
    setAnswers((prev) => ({ ...prev, p1_goal: val }));
    trackFunnelStep('reachedPart1Confirm');
    refreshData();
    setTimeout(() => goToStep('p1_confirm'), 180);
  };

  // Part 1 Confirm handlers
  const handleConfirmPart1 = () => {
    goToStep('feedback_ratings');
  };

  const handleEditPart1 = (questionIndex?: number) => {
    if (questionIndex === 1) goToStep('p1_q1');
    else if (questionIndex === 2) goToStep('p1_q2');
    else if (questionIndex === 3) goToStep('p1_q3');
    else if (questionIndex === 4) goToStep('p1_q4');
    else goToStep('p1_q1');
  };

  // Part 2 Recap Materi Handlers
  const handleSelectRecapQuestion = (qId: number, option: string) => {
    const updated = { ...recapAnswers, [qId]: option };
    setRecapAnswers(updated);

    if (qId < 10) {
      setTimeout(() => goToStep(`recap_q${qId + 1}` as StepId), 180);
    } else {
      // Calculate score for 10 recap questions
      let correct = 0;
      RECAP_QUESTIONS.forEach((q) => {
        if (updated[q.id] === q.correctAnswer) {
          correct += 1;
        }
      });
      setRecapCorrectCount(correct);
      setAnswers((prev) => ({
        ...prev,
        recap_answers: updated,
        recap_correct_count: correct,
      }));
      setTimeout(() => goToStep('recap_processing'), 180);
    }
  };

  const handleRecapProcessingComplete = () => {
    goToStep('recap_mini_result', false);
  };

  const handleContinueFromRecap = () => {
    goToStep('p2_q1');
  };

  // Part 2 Selection handlers
  const handleSelectP2Q1 = (val: 'Setuju' | 'Tidak setuju') => {
    setAnswers((prev) => ({ ...prev, p2_skill_utama: val }));
    setTimeout(() => goToStep('p2_q2'), 180);
  };

  const handleSelectP2Q2 = (val: 'Setuju' | 'Tidak setuju') => {
    setAnswers((prev) => ({ ...prev, p2_dampak_penghasilan: val }));
    setTimeout(() => goToStep('p2_q3'), 180);
  };

  const handleSelectP2Q3 = (
    val: 'Pemula banget' | 'Paham dasar' | 'Cukup mahir' | 'Sangat mahir'
  ) => {
    setAnswers((prev) => ({ ...prev, p2_kemampuan_sekarang: val }));
    setTimeout(() => handleNextFromP2Q3(), 180);
  };

  const handleToggleP2Q4Tool = (tool: string) => {
    setAnswers((prev) => {
      const current = prev.p2_tools || [];
      if (tool === 'Belum pernah satupun') {
        // If clicking "Belum pernah satupun", deselect other tools
        return { ...prev, p2_tools: ['Belum pernah satupun'] };
      }

      // If selecting a real tool, remove "Belum pernah satupun"
      const withoutNone = current.filter((t) => t !== 'Belum pernah satupun');
      if (withoutNone.includes(tool)) {
        return { ...prev, p2_tools: withoutNone.filter((t) => t !== tool) };
      } else {
        return { ...prev, p2_tools: [...withoutNone, tool] };
      }
    });
  };

  const handleNextP2Q4 = () => {
    goToStep('p2_q5');
  };

  const handleSelectP2Q5 = (
    val:
      | 'Bisnis sendiri'
      | 'Perusahaan tempat saya bekerja'
      | 'Klien freelance'
      | 'Agency'
      | 'Belum tahu'
  ) => {
    setAnswers((prev) => ({ ...prev, p2_tempat_penerapan: val }));
    trackFunnelStep('reachedPart2Interstitial');
    refreshData();
    setTimeout(() => goToStep('p2_interstitial'), 180);
  };

  const handleNextPart2Interstitial = () => {
    trackFunnelStep('startedPart3');
    refreshData();
    goToStep('p3_q1');
  };

  // Part 3 Selection handlers
  const handleSelectP3Q1 = (
    val:
      | 'Hands-on handle brand langsung di Ads Manager'
      | 'Analisis data performance'
      | 'Study case dari agency'
      | 'Semua di atas'
  ) => {
    setAnswers((prev) => ({ ...prev, p3_jenis_latihan: val }));
    setTimeout(() => goToStep('p3_q2'), 180);
  };

  const handleSelectP3Q2 = (
    val:
      | 'Live class interaktif'
      | 'Rekaman fleksibel'
      | 'Mentoring 1:1'
      | 'Kombinasi'
  ) => {
    setAnswers((prev) => ({ ...prev, p3_cara_belajar: val }));
    setTimeout(() => goToStep('p3_q3'), 180);
  };

  const handleSelectP3Q3 = (
    val: 'Teori dulu, baru praktik' | 'Langsung praktik sambil belajar'
  ) => {
    setAnswers((prev) => ({ ...prev, p3_pendekatan: val }));
    setTimeout(() => goToStep('p3_q4'), 180);
  };

  const handleSelectP3Q4 = (
    val:
      | 'Bentrok dengan waktu kerja'
      | 'Belum punya sosok guru yang bisa diajak diskusi'
      | 'Tidak tahu mulai dari mana'
      | 'Semuanya di atas'
  ) => {
    setAnswers((prev) => ({ ...prev, p3_kendala_terbesar: val }));
    trackFunnelStep('reachedProcessing');
    refreshData();
    setTimeout(() => goToStep('processing'), 180);
  };

  const handleProcessingComplete = () => {
    trackFunnelStep('reachedLeadForm');
    refreshData();
    goToStep('lead_form', false);
  };

  // Form submission
  const handleLeadFormSubmit = (userContact: UserContact) => {
    const { score } = calculateMatchScore(answers);
    const goalNarrative = getGoalNarrative(answers.p1_goal, score);
    const hambatanRingkasan = getHambatanText(answers.p3_kendala_terbesar);

    const record = saveSubmission(
      userContact,
      answers,
      score,
      goalNarrative,
      hambatanRingkasan
    );

    setCurrentSubmission(record);
    refreshData();
    goToStep('result', false);
  };

  const handleCtaClick = () => {
    if (currentSubmission) {
      markCtaClicked(currentSubmission.id);
      refreshData();
    }
  };

  const handleRetake = () => {
    setGoalOther(false);
    setAnswers({ feedback: { clarity: 4, expectations: 4, interaction: 4 } });
    setRecapAnswers({});
    setRecapCorrectCount(0);
    setCurrentSubmission(null);
    setHistory([]);
    goToStep('welcome', false);
  };

  // Step metadata for segmented progress bar (Part 1 to Part 4)
  const getStepProgress = (): {
    currentPart: number;
    stepInPart: number;
    totalInPart: number;
  } => {
    switch (currentStep) {
      // Part 1: Profiling (1-5)
      case 'p1_q1':
        return { currentPart: 1, stepInPart: 1, totalInPart: 5 };
      case 'p1_q2':
        return { currentPart: 1, stepInPart: 2, totalInPart: 5 };
      case 'p1_q3':
        return { currentPart: 1, stepInPart: 3, totalInPart: 5 };
      case 'p1_q4':
        return { currentPart: 1, stepInPart: 4, totalInPart: 5 };
      case 'p1_confirm':
        return { currentPart: 1, stepInPart: 5, totalInPart: 5 };

      // Part 2: Recap Materi (1-10)
      case 'recap_intro':
        return { currentPart: 2, stepInPart: 0, totalInPart: 10 };
      case 'recap_q1':
        return { currentPart: 2, stepInPart: 1, totalInPart: 10 };
      case 'recap_q2':
        return { currentPart: 2, stepInPart: 2, totalInPart: 10 };
      case 'recap_q3':
        return { currentPart: 2, stepInPart: 3, totalInPart: 10 };
      case 'recap_q4':
        return { currentPart: 2, stepInPart: 4, totalInPart: 10 };
      case 'recap_q5':
        return { currentPart: 2, stepInPart: 5, totalInPart: 10 };
      case 'recap_q6':
        return { currentPart: 2, stepInPart: 6, totalInPart: 10 };
      case 'recap_q7':
        return { currentPart: 2, stepInPart: 7, totalInPart: 10 };
      case 'recap_q8':
        return { currentPart: 2, stepInPart: 8, totalInPart: 10 };
      case 'recap_q9':
        return { currentPart: 2, stepInPart: 9, totalInPart: 10 };
      case 'recap_q10':
      case 'recap_processing':
      case 'recap_mini_result':
        return { currentPart: 2, stepInPart: 10, totalInPart: 10 };

      // Part 3 (formerly Part 2): Belief Priming & Level Check (1-6)
      case 'p2_q1':
        return { currentPart: 3, stepInPart: 1, totalInPart: 6 };
      case 'p2_q2':
        return { currentPart: 3, stepInPart: 2, totalInPart: 6 };
      case 'p2_q3':
        return { currentPart: 3, stepInPart: 3, totalInPart: 6 };
      case 'p2_q4':
        return { currentPart: 3, stepInPart: 4, totalInPart: 6 };
      case 'p2_q5':
        return { currentPart: 3, stepInPart: 5, totalInPart: 6 };
      case 'p2_interstitial':
        return { currentPart: 3, stepInPart: 6, totalInPart: 6 };

      // Part 4 (formerly Part 3): Gaya Belajar (1-5)
      case 'p3_q1':
        return { currentPart: 4, stepInPart: 1, totalInPart: 4 };
      case 'p3_q2':
        return { currentPart: 4, stepInPart: 2, totalInPart: 4 };
      case 'p3_q3':
        return { currentPart: 4, stepInPart: 3, totalInPart: 4 };
      case 'p3_q4':
        return { currentPart: 4, stepInPart: 4, totalInPart: 4 };

      // Part 5: Form Data Diri
      case 'lead_form':
        return { currentPart: 5, stepInPart: 1, totalInPart: 1 };
      default:
        return { currentPart: 1, stepInPart: 0, totalInPart: 5 };
    }
  };

  const showHeaderProgress =
    currentStep !== 'welcome' &&
    currentStep !== 'recap_processing' &&
    currentStep !== 'processing' &&
    currentStep !== 'result';

  const progressMeta = getStepProgress();

  return (
    <div className="min-h-screen sm:h-screen sm:max-h-screen sm:overflow-hidden flex flex-col bg-[#FFFFFF] text-[#231F20]">
      {/* Top Header shown only on Welcome */}
      {currentStep === 'welcome' && <Header />}

      {/* Kodree-style Top Segmented Progress Bar */}
      {showHeaderProgress && (
        <ProgressBar
          currentPart={currentStep.startsWith('feedback_') ? 2 : progressMeta.currentPart === 1 ? 1 : progressMeta.currentPart + 1}
          stepInPart={currentStep.startsWith('feedback_') ? ['feedback_ratings', 'feedback_duration', 'feedback_text'].indexOf(currentStep) + 1 : progressMeta.stepInPart}
          totalInPart={currentStep.startsWith('feedback_') ? 3 : progressMeta.totalInPart}
          onBack={goBack}
          canGoBack={history.length > 0}
        />
      )}

      {/* Main Viewport Container */}
      <main className={`flex-1 min-h-0 flex flex-col items-center py-2 px-3 ${currentStep.startsWith('feedback_') || currentStep === 'result' || currentStep === 'welcome' || currentStep === 'p1_q4' ? 'justify-start overflow-y-auto' : 'justify-center overflow-y-auto sm:overflow-hidden'}`}>
        {/* Step: Welcome Screen */}
        {currentStep === 'welcome' && (
          <div className="w-full max-w-[420px] mx-auto py-3 sm:py-5">
            <div className="text-center mb-4">
              <span className="text-[11px] font-bold text-[#EA5543] uppercase tracking-wider bg-[#F9EDDE] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mb-2">
                <Sparkles className="w-3 h-3" />
                Penutup Sesi Mini Class
              </span>
              <h1 className="font-heading text-lg sm:text-xl font-extrabold text-[#231F20] tracking-tight leading-snug">
                Post Test Fundamental Performance Marketing
              </h1>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Selesaikan langkah terakhir mini class untuk mengulas materi dan mendapatkan sertifikat
              </p>
            </div>

            {/* Feature Cards */}
            <div className="bg-[#F9EDDE]/30 border border-[#F9EDDE] rounded-2xl p-2.5 mb-3 grid grid-cols-2 gap-x-3 gap-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-white border border-[#F9EDDE] flex items-center justify-center text-[#BD214C] shrink-0">
                  <Award className="w-3 h-3" />
                </div>
                <h3 className="font-heading font-bold text-[11px] text-[#231F20]">
                  Hanya &lt;5 menit
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-white border border-[#F9EDDE] flex items-center justify-center text-[#BD214C] shrink-0">
                  <Sparkles className="w-3 h-3" />
                </div>
                <h3 className="font-heading font-bold text-[11px] text-[#231F20]">
                  Feedback
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-white border border-[#F9EDDE] flex items-center justify-center text-[#BD214C] shrink-0">
                  <Clock className="w-3 h-3" />
                </div>
                <h3 className="font-heading font-bold text-[11px] text-[#231F20]">
                  Quiz recap materi mini class
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-white border border-[#F9EDDE] flex items-center justify-center text-[#BD214C] shrink-0">
                  <BookOpen className="w-3 h-3" />
                </div>
                <h3 className="font-heading font-bold text-[11px] text-[#231F20]">
                  Mini asesmen
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-white border border-[#F9EDDE] flex items-center justify-center text-[#BD214C] shrink-0">
                  <CheckCircle className="w-3 h-3" />
                </div>
                <h3 className="font-heading font-bold text-[11px] text-[#231F20]">
                  Sertiffikat
                </h3>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="certificate-name" className="block text-xs font-semibold mb-1">Nama untuk sertifikat</label>
              <input id="certificate-name" type="text" autoComplete="name" maxLength={150} value={certificateName} onChange={(event) => setCertificateName(event.target.value)} placeholder="Tulis nama yang ingin tercetak di sertifikat" className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[#BD214C]" aria-describedby="certificate-name-help" />
              <p id="certificate-name-help" className="text-[10px] text-gray-500 mt-1">Isi minimal 3 karakter. Kamu bisa mengoreksinya sebelum mengirim data.</p>
            </div>
            {/* Start Button */}
            <button
              type="button"
              onClick={handleStart}
              disabled={certificateName.trim().length < 3}
              className="w-full py-3.5 px-5 rounded-xl bg-[#BD214C] hover:bg-[#a61c42] text-white font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-[#BD214C]/25 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Mulai Post Test Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentStep.startsWith('feedback_') && (
          <FeedbackScreen
            step={currentStep === 'feedback_ratings' ? 'ratings' : currentStep === 'feedback_duration' ? 'duration' : 'text'}
            feedback={answers.feedback || {}}
            onChange={(feedback) => setAnswers((prev) => ({ ...prev, feedback }))}
            onNext={() => {
              if (currentStep === 'feedback_text') {
                trackFunnelStep('startedPart2');
                refreshData();
              }
              goToStep(currentStep === 'feedback_ratings' ? 'feedback_duration' : currentStep === 'feedback_duration' ? 'feedback_text' : 'recap_intro');
            }}
          />
        )}
        {/* Part 1 Question 1 */}
        {currentStep === 'p1_q1' && (
          <QuestionCard
            questionNumber={1}
            totalInPart={4}
            questionText="Sudah pernah menjalankan iklan digital sebelumnya?"
            subText="Misalnya Meta Ads, Google Ads, TikTok Ads, atau marketplace ads."
            options={['Sudah', 'Belum']}
            selectedValues={answers.p1_pernah_iklan ? [answers.p1_pernah_iklan] : []}
            onSelect={(val) => handleSelectP1Q1(val as 'Sudah' | 'Belum')}
          />
        )}

        {/* Part 1 Question 2 */}
        {currentStep === 'p1_q2' && (
          <QuestionCard
            questionNumber={2}
            totalInPart={4}
            questionText="Berapa rentang usia kamu saat ini?"
            options={['19-23', '24-29', '30-35', '>35']}
            selectedValues={answers.p1_usia ? [answers.p1_usia] : []}
            onSelect={(val) =>
              handleSelectP1Q2(val as '19-23' | '24-29' | '30-35' | '>35')
            }
          />
        )}

        {/* Part 1 Question 3 */}
        {currentStep === 'p1_q3' && (
          <QuestionCard
            questionNumber={3}
            totalInPart={4}
            questionText="Pekerjaan kamu saat ini?"
            options={[
              'Pekerja kantoran',
              'Freelance',
              'Pemilik bisnis',
              'Fresh graduate',
            ]}
            selectedValues={answers.p1_pekerjaan ? [answers.p1_pekerjaan] : []}
            onSelect={(val) =>
              handleSelectP1Q3(
                val as
                  | 'Pekerja kantoran'
                  | 'Freelance'
                  | 'Pemilik bisnis'
                  | 'Fresh graduate'
              )
            }
          />
        )}

        {/* Part 1 Question 4 */}
        {currentStep === 'p1_q4' && (
          <QuestionCard
            questionNumber={4}
            totalInPart={4}
            questionText="Goal utama kamu mengikuti Mini Class Performance Marketing?"
            subText="Tujuan ini akan menentukan rekomendasi program karier kamu."
            options={['Cari pekerjaan pertama', 'Bikin bisnis', 'Switch career', 'Upskill untuk kebutuhan kerjaan', 'Lainnya']}
            selectedValues={goalOther ? ['Lainnya'] : answers.p1_goal ? [answers.p1_goal] : []}
            onSelect={(val) => {
              if (val === 'Lainnya') {
                setGoalOther(true);
                if (!goalOther) setAnswers((prev) => ({ ...prev, p1_goal: '' }));
              } else {
                setGoalOther(false);
                handleSelectP1Q4(val as 'Cari pekerjaan pertama' | 'Bikin bisnis' | 'Switch career' | 'Upskill untuk kebutuhan kerjaan');
              }
            }}
            customOption={{
              value: goalOther ? answers.p1_goal || '' : '',
              onChange: (value) => {
                setGoalOther(true);
                setAnswers((prev) => ({ ...prev, p1_goal: value }));
              },
            }}
            showNext={goalOther}
            canNext={!!answers.p1_goal?.trim()}
            onNext={() => {
              if (!answers.p1_goal?.trim()) return;
              setAnswers((prev) => ({ ...prev, p1_goal: prev.p1_goal?.trim() }));
              trackFunnelStep('reachedPart1Confirm');
              refreshData();
              goToStep('p1_confirm');
            }}
          />
        )}

        {/* Part 1 Step 5: Confirmation */}
        {currentStep === 'p1_confirm' && (
          <Part1Confirmation
            answers={answers}
            onConfirm={handleConfirmPart1}
            onEdit={handleEditPart1}
          />
        )}

        {/* Part 2: Recap Intro */}
        {currentStep === 'recap_intro' && (
          <RecapIntro onStart={() => goToStep('recap_q1')} />
        )}

        {/* Part 2 Questions 1-10 */}
        {currentStep.startsWith('recap_q') && (() => {
          const qNum = parseInt(currentStep.replace('recap_q', ''), 10);
          const qData = RECAP_QUESTIONS[qNum - 1];
          if (!qData) return null;
          return (
            <QuestionCard
              questionNumber={qNum}
              totalInPart={10}
              questionText={qData.question}
              subText={qData.subText}
              options={qData.options}
              selectedValues={recapAnswers[qNum] ? [recapAnswers[qNum]] : []}
              onSelect={(val) => handleSelectRecapQuestion(qNum, val)}
            />
          );
        })()}

        {/* Part 2: Recap Processing */}
        {currentStep === 'recap_processing' && (
          <RecapProcessing onComplete={handleRecapProcessingComplete} />
        )}

        {/* Part 2: Recap Mini Result */}
        {currentStep === 'recap_mini_result' && (
          <RecapMiniResult
            correctCount={recapCorrectCount}
            totalQuestions={10}
            onContinue={handleContinueFromRecap}
          />
        )}

        {/* Part 3 (formerly Part 2) Question 1 */}
        {currentStep === 'p2_q1' && (
          <QuestionCard
            questionNumber={1}
            totalInPart={5}
            questionText="Kamu setuju performance marketing jadi skill utama yang dibutuhkan bisnis saat ini?"
            options={['Setuju', 'Tidak setuju']}
            selectedValues={answers.p2_skill_utama ? [answers.p2_skill_utama] : []}
            onSelect={(val) => handleSelectP2Q1(val as 'Setuju' | 'Tidak setuju')}
          />
        )}

        {/* Part 2 Question 2 */}
        {currentStep === 'p2_q2' && (
          <QuestionCard
            questionNumber={2}
            totalInPart={5}
            questionText="Kamu setuju menguasai performance marketing bisa berdampak positif ke penghasilan?"
            options={['Setuju', 'Tidak setuju']}
            selectedValues={
              answers.p2_dampak_penghasilan ? [answers.p2_dampak_penghasilan] : []
            }
            onSelect={(val) =>
              handleSelectP2Q2(val as 'Setuju' | 'Tidak setuju')
            }
          />
        )}

        {/* Part 2 Question 3 */}
        {currentStep === 'p2_q3' && (
          <QuestionCard
            questionNumber={3}
            totalInPart={5}
            questionText="Bagaimana kamu menilai kemampuan performance marketing kamu sekarang?"
            options={['Pemula banget', 'Paham dasar', 'Cukup mahir', 'Sangat mahir']}
            selectedValues={
              answers.p2_kemampuan_sekarang ? [answers.p2_kemampuan_sekarang] : []
            }
            onSelect={(val) =>
              handleSelectP2Q3(
                val as 'Pemula banget' | 'Paham dasar' | 'Cukup mahir' | 'Sangat mahir'
              )
            }
          />
        )}

        {/* Part 2 Question 4 (Multi-select, skip if Part 1 #1 == Belum) */}
        {currentStep === 'p2_q4' && (
          <QuestionCard
            questionNumber={4}
            totalInPart={5}
            questionText="Platform atau tools apa yang pernah kamu pakai?"
            subText="Pilih semua tools yang pernah kamu operasikan."
            options={[
              'Meta Ads',
              'Google Ads',
              'TikTok Ads',
              'Belum pernah satupun',
            ]}
            isMultiSelect={true}
            selectedValues={answers.p2_tools || []}
            onSelect={handleToggleP2Q4Tool}
            onNext={handleNextP2Q4}
            canNext={(answers.p2_tools || []).length > 0}
          />
        )}

        {/* Part 2 Question 5 */}
        {currentStep === 'p2_q5' && (
          <QuestionCard
            questionNumber={5}
            totalInPart={5}
            questionText="Di mana kamu ingin menerapkan skill ini?"
            options={[
              'Bisnis sendiri',
              'Perusahaan tempat saya bekerja',
              'Klien freelance',
              'Agency',
              'Belum tahu',
            ]}
            selectedValues={
              answers.p2_tempat_penerapan ? [answers.p2_tempat_penerapan] : []
            }
            onSelect={(val) =>
              handleSelectP2Q5(
                val as
                  | 'Bisnis sendiri'
                  | 'Perusahaan tempat saya bekerja'
                  | 'Klien freelance'
                  | 'Agency'
                  | 'Belum tahu'
              )
            }
          />
        )}

        {/* Part 2 Screen 6: Interstitial Alumni */}
        {currentStep === 'p2_interstitial' && (
          <InterstitialAlumni onNext={handleNextPart2Interstitial} />
        )}

        {/* Part 3 Question 1 */}
        {currentStep === 'p3_q1' && (
          <QuestionCard
            questionNumber={1}
            totalInPart={4}
            questionText="Jenis latihan apa yang paling kamu suka?"
            options={[
              'Hands-on handle brand langsung di Ads Manager',
              'Analisis data performance',
              'Study case dari agency',
              'Semua di atas',
            ]}
            selectedValues={
              answers.p3_jenis_latihan ? [answers.p3_jenis_latihan] : []
            }
            onSelect={(val) =>
              handleSelectP3Q1(
                val as
                  | 'Hands-on handle brand langsung di Ads Manager'
                  | 'Analisis data performance'
                  | 'Study case dari agency'
                  | 'Semua di atas'
              )
            }
          />
        )}

        {/* Part 3 Question 2 */}
        {currentStep === 'p3_q2' && (
          <QuestionCard
            questionNumber={2}
            totalInPart={4}
            questionText="Kamu lebih suka belajar dengan cara apa?"
            options={[
              'Live class interaktif',
              'Rekaman fleksibel',
              'Mentoring 1:1',
              'Kombinasi',
            ]}
            selectedValues={answers.p3_cara_belajar ? [answers.p3_cara_belajar] : []}
            onSelect={(val) =>
              handleSelectP3Q2(
                val as
                  | 'Live class interaktif'
                  | 'Rekaman fleksibel'
                  | 'Mentoring 1:1'
                  | 'Kombinasi'
              )
            }
          />
        )}

        {/* Part 3 Question 3 */}
        {currentStep === 'p3_q3' && (
          <QuestionCard
            questionNumber={3}
            totalInPart={4}
            questionText="Pendekatan mana yang lebih cocok buat kamu?"
            options={[
              'Teori dulu, baru praktik',
              'Langsung praktik sambil belajar',
            ]}
            selectedValues={answers.p3_pendekatan ? [answers.p3_pendekatan] : []}
            onSelect={(val) =>
              handleSelectP3Q3(
                val as 'Teori dulu, baru praktik' | 'Langsung praktik sambil belajar'
              )
            }
          />
        )}

        {/* Part 3 Question 4 */}
        {currentStep === 'p3_q4' && (
          <QuestionCard
            questionNumber={4}
            totalInPart={4}
            questionText="Apa kendala terbesar kamu saat ini untuk belajar performance marketing?"
            options={[
              'Bentrok dengan waktu kerja',
              'Belum punya sosok guru yang bisa diajak diskusi',
              'Tidak tahu mulai dari mana',
              'Semuanya di atas',
            ]}
            selectedValues={
              answers.p3_kendala_terbesar ? [answers.p3_kendala_terbesar] : []
            }
            onSelect={(val) =>
              handleSelectP3Q4(
                val as
                  | 'Bentrok dengan waktu kerja'
                  | 'Belum punya sosok guru yang bisa diajak diskusi'
                  | 'Tidak tahu mulai dari mana'
                  | 'Semuanya di atas'
              )
            }
          />
        )}

        {/* Part 4 (a) Processing Screen */}
        {currentStep === 'processing' && (
          <ProcessingScreen onComplete={handleProcessingComplete} />
        )}

        {/* Part 4 (b) Form Data Diri */}
        {currentStep === 'lead_form' && (
          <LeadForm
            initialName={certificateName.trim()}
            onSubmit={handleLeadFormSubmit}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
          />
        )}

        {/* Part 4 (c) Result Screen */}
        {currentStep === 'result' && currentSubmission && (
          <ResultScreen
            submission={currentSubmission}
            onCtaClick={handleCtaClick}
            onRetake={handleRetake}
          />
        )}
      </main>

      {/* Privacy Policy Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Mobile Footer branding - shown on welcome & result only */}
      {(currentStep === 'welcome' || currentStep === 'result') && (
        <footer className="w-full py-2.5 text-center text-[11px] text-gray-400 border-t border-gray-100 bg-white">
          <span>© 2026 Boleh Belajar · Fundamental Performance Marketing</span>
        </footer>
      )}
    </div>
  );
}
