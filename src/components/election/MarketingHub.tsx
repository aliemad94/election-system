'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  FileText, 
  Download, 
  Tv, 
  Info, 
  CheckCircle2, 
  Volume2, 
  Clock, 
  Search, 
  Users, 
  TrendingUp, 
  PieChart, 
  DollarSign, 
  MapPin, 
  UserCheck, 
  FileSpreadsheet, 
  Layers
} from 'lucide-react';

interface Scene {
  id: number;
  title: string;
  time: string;
  duration: number; // in seconds
  voiceover: string;
  visualDescription: string;
  actionText: string;
}

const SCENES: Scene[] = [
  {
    id: 1,
    title: "الهوك الافتتاحي (The Hook)",
    time: "00:00 - 00:25",
    duration: 25,
    voiceover: "هل ما زلت تدير حملتك الانتخابية بالحدس والتخمين؟ في الانتخابات الحديثة، لا يفوز دائماً من يملك أكبر جمهور… بل من يملك أفضل المعلومات، وأدق التحليلات.",
    visualDescription: "شاشة سوداء تتدفق عليها نقاط بيانات وخطوط رقمية ذهبية بهدوء، ثم لقطات خاطفة متحركة من لوحة التحكم لتشويق المشاهد.",
    actionText: "طرح السؤال الجوهري لتنبيه قيادة الحملة وجذب الانتباه الفوري."
  },
  {
    id: 2,
    title: "تقديم المنصة (Introduction)",
    time: "00:25 - 00:45",
    duration: 20,
    voiceover: "هذا هو نظام تحليل بيانات الناخبين — منصة متكاملة تحوّل العمل الانتخابي من الفوضى والعلاقات العامة العشوائية، إلى إدارة سياسية مبنية على البيانات والأرقام والمؤشرات.",
    visualDescription: "الانتقال السلس إلى بوابة تسجيل الدخول، ثم كتابة اسم المستخدم ودخول تلقائي واثق إلى لوحة القيادة المركزية.",
    actionText: "عرض الهوية البصرية وشعار المنصة وتأكيد جاهزية النظام للدخول الآمن."
  },
  {
    id: 3,
    title: "لوحة المعلومات: النظرة الشاملة",
    time: "00:45 - 01:15",
    duration: 30,
    voiceover: "من لحظة الدخول، تضعك لوحة المعلومات أمام الصورة الكاملة لحملتك: عدد الناخبين المسجلين، نسبة المشاركة المتوقعة، توزيع المقاعد المرجّح، والحالات التي تحتاج تدخلاً فورياً — كل هذا في شاشة واحدة، بتحديث لحظي.",
    visualDescription: "عرض أربع بطاقات إحصائية للمؤشرات الرئيسية، ونزول تدريجي لعرض المخططات والرسوم البيانية وتوزيع الدعم الجغرافي.",
    actionText: "بناء الثقة بتقديم لوحة قيادة متكاملة للقرار الفوري بدلاً من التقارير الورقية المتناثرة."
  },
  {
    id: 4,
    title: "الناخبون: قاعدة بيانات سياسية موحدة",
    time: "01:15 - 01:45",
    duration: 30,
    voiceover: "يقوم النظام بجمع وتنظيم بيانات كل ناخب على حدة: هويته، منطقته، انتماؤه القبلي، حالة تصويته، والمفتاح الانتخابي المسؤول عنه. بدلاً من دفاتر مبعثرة وأرقام هواتف متناثرة، تمتلك قاعدة بيانات سياسية واحدة، منظمة، وقابلة للبحث والفلترة في ثوانٍ.",
    visualDescription: "الدخول إلى صفحة السجلات، كتابة اسم ناخب تجريبي والبحث عنه، ثم فتح نافذة إضافة ناخب جديد واستعراض الحقول المترابطة.",
    actionText: "توضيح تنظيم الهيكل التنظيمي للمفاتيح الانتخابية والناخبين لحصر وتصنيف مؤيدي القائمة بدقة."
  },
  {
    id: 5,
    title: "المؤشرات: من الأرقام إلى القرار",
    time: "01:45 - 02:30",
    duration: 45,
    voiceover: "وهنا يبدأ الفرق الحقيقي. يحوّل النظام هذه البيانات الخام إلى مؤشرات عملية تجيب عن الأسئلة التي تحدد مصير أي حملة: أين مناطق القوة؟ أين مناطق الضعف? كم تملك من الأصوات الحقيقية؟ وأين يجب أن تركّز جهدك ومواردك؟ المؤشر الأول يقيس قوتك الانتخابية الفعلية في كل منطقة وكل عشيرة، والمؤشر الثاني يقيس مدى كفاءة توزيع مواردك مقارنة بالحاجة الفعلية على الأرض. كل رقم على الشاشة خلفه معادلة واضحة، لا تقدير عشوائي.",
    visualDescription: "التكبير على مؤشرات الأداء الأربعة (المؤشر العام، توزيع الموارد، المشاركة، كفاءة المفتاح)، وعرض نافذة منهجية الاحتساب والمعادلات الرياضية المعتمدة.",
    actionText: "تسويق الجانب العلمي والذكاء التحليلي للمنظومة لتعزيز الموثوقية لدى المرشحين."
  },
  {
    id: 6,
    title: "توقعات المقاعد: بمنهجية معتمدة",
    time: "02:30 - 03:00",
    duration: 30,
    voiceover: "بناءً على هذه المؤشرات، يحاكي النظام توزيع المقاعد وفق الطريقة المعتمدة رسمياً في توزيع المقاعد بعدالة، مع معامل القسمة العراقي المعدَّل. لتعرف بدقة: كم مقعداً محسوماً لصالحك؟ كم مقعداً ما زال قابلاً للتنافس؟ وما احتمال وصولك إلى الأغلبية المطلوبة — قبل أن يبدأ التصويت الفعلي.",
    visualDescription: "عرض خريطة توزيع مقاعد البرلمان/المجلس الدائرية الملونة، وجدول القوائم المتنافسة المعتمد على محاكاة طريقة سانت ليغو المعدلة.",
    actionText: "تأكيد القدرة على حساب المقاعد بناءً على الحسابات الانتخابية الدقيقة للقانون الانتخابي الفعلي."
  },
  {
    id: 7,
    title: "القبائل والمفاتيح: القوة الحقيقية",
    time: "03:00 - 03:35",
    duration: 35,
    voiceover: "كما يوفر النظام آلية علمية لتقييم كل مفتاح انتخابي، من خلال قياس ولائه، وتأثيره الفعلي، وقدرته على التحشيد، وقدرته على حماية الأصوات. فبدلاً من الاعتماد على انطباعات شخصية عن كل مفتاح أو كل شيخ عشيرة، تحصل على صورة رقمية دقيقة لقوتك الانتخابية الحقيقية على الأرض.",
    visualDescription: "عرض صفحة القبائل وحجم الدعم المتوقع ونسب التزام المفاتيح، والنزول لبطاقات المفاتيح لتقييم كفاءة كل عنصر ميداني بالأرقام.",
    actionText: "التركيز على الثقل الاجتماعي والعشائري في محافظة ذي قار وكيفية تحويله لقياسات رقمية دقيقة."
  },
  {
    id: 8,
    title: "الحملة الانتخابية: الميزانية والفعاليات",
    time: "03:35 - 04:00",
    duration: 25,
    voiceover: "ويمتد دور النظام إلى إدارة الحملة نفسها: متابعة الإنفاق أولاً بأول، حساب العائد الفعلي لكل دينار يُصرف، وجدولة الفعاليات الميدانية — بحيث تعرف بالضبط أين تذهب ميزانيتك، ولماذا.",
    visualDescription: "استعراض لوحة الإدارة المالية، وتوزيع النفقات والفعاليات الميدانية لحملة ذي قار وعائد الاستثمار المالي لكل منطقة.",
    actionText: "حماية الحملة من الهدر المالي وتحقيق أعلى كفاءة للموارد المتاحة."
  },
  {
    id: 9,
    title: "التقارير الذكية والخاتمة",
    time: "04:00 - 04:25",
    duration: 25,
    voiceover: "ومن خلال لوحات المتابعة والتقارير الذكية، تستطيع قراءة المشهد الانتخابي بوضوح أكبر، وإدارة يوم الاقتراع بكفاءة أعلى، وبناء قاعدة بيانات سياسية تستمر معك إلى ما بعد الانتخابات. نظام واحد… يجمع البيانات، يحلّلها، ويحوّلها إلى قرارات انتخابية أكثر دقة وفعالية. لأن الفوز في الانتخابات يبدأ من فهم الناخبين.",
    visualDescription: "عرض أزرار تصدير التقارير الفورية بصيغ PDF/Excel، وحركة موزاييك مجمعة للشاشات، ثم استقرار الصورة على شعار المنصة الذهبي الفاخر.",
    actionText: "موازنة وتلخيص القيمة المضافة للمنصة وتثبيت الجملة الختامية للعلامة التجارية في ذهن المشاهد."
  },
  {
    id: 10,
    title: "الدعوة إلى العمل (Call To Action)",
    time: "04:25 - 04:35",
    duration: 10,
    voiceover: "تواصل معنا اليوم، واحجز عرضاً تجريبياً مباشراً على بيانات منطقتك.",
    visualDescription: "شاشة ختامية بلون حبري داكن مع بريق ذهبي، يظهر فيها شعار المنصة ومعلومات التواصل المباشرة وزر حجز موعد.",
    actionText: "دفع المهتمين للتواصل الفوري وطلب عرض مخصص."
  }
];

export default function MarketingHub() {
  const [activeTab, setActiveTab] = useState<'interactive' | 'full-script' | 'guidelines'>('interactive');
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2>(1);
  const [progress, setProgress] = useState(0);
  const [demoLoginState, setDemoLoginState] = useState<'idle' | 'typing-user' | 'typing-pass' | 'loading' | 'success'>('idle');
  const [demoSearchText, setDemoSearchText] = useState('');
  const [demoVoters, setDemoVoters] = useState<Array<{ name: string; district: string; tribe: string; status: string }>>([]);
  const [demoVoterDetail, setDemoVoterDetail] = useState<any>(null);
  
  // CTA Form State
  const [ctaName, setCtaName] = useState('');
  const [ctaPhone, setCtaPhone] = useState('');
  const [ctaSubmitted, setCtaSubmitted] = useState(false);

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentScene = SCENES[currentSceneIdx];

  // Auto-play timer management
  useEffect(() => {
    if (isPlaying) {
      const stepTimeMs = 100;
      const totalSteps = (currentScene.duration * 1000) / stepTimeMs / playbackSpeed;
      let currentStep = (progress / 100) * totalSteps;

      progressIntervalRef.current = setInterval(() => {
        currentStep += 1;
        const newProgress = (currentStep / totalSteps) * 100;
        if (newProgress >= 100) {
          setProgress(0);
          clearInterval(progressIntervalRef.current!);
          
          if (currentSceneIdx < SCENES.length - 1) {
            setCurrentSceneIdx(prev => prev + 1);
          } else {
            setIsPlaying(false);
            setCurrentSceneIdx(0);
          }
        } else {
          setProgress(newProgress);
        }
      }, stepTimeMs);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, currentSceneIdx, playbackSpeed, progress]);

  // Demo simulations updates based on active scene
  useEffect(() => {
    setProgress(0);
    
    if (currentScene.id === 2) {
      setDemoLoginState('idle');
      const t1 = setTimeout(() => setDemoLoginState('typing-user'), 1000);
      const t2 = setTimeout(() => setDemoLoginState('typing-pass'), 3000);
      const t3 = setTimeout(() => setDemoLoginState('loading'), 5000);
      const t4 = setTimeout(() => setDemoLoginState('success'), 6500);
      return () => {
        clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
      };
    }

    if (currentScene.id === 4) {
      setDemoSearchText('');
      setDemoVoters([]);
      setDemoVoterDetail(null);
      
      const t1 = setTimeout(() => {
        let text = 'علي ';
        setDemoSearchText(text);
        const interval = setInterval(() => {
          if (text.length < 8) {
            text += 'عماد'[text.length - 4] || '';
            setDemoSearchText(text);
          } else {
            clearInterval(interval);
          }
        }, 200);
      }, 1000);

      const t2 = setTimeout(() => {
        setDemoVoters([
          { name: 'علي عماد خضير', district: 'الناصرية (الصالحية)', tribe: 'خفاجة', status: 'مؤمّن' },
          { name: 'علي عماد عبد الحسن', district: 'الشطرة', tribe: 'عبودة', status: 'متابعة' },
          { name: 'علي عماد كاظم', district: 'سوق الشيوخ', tribe: 'بني أسد', status: 'مؤمّن' }
        ]);
      }, 3200);

      const t3 = setTimeout(() => {
        setDemoVoterDetail({
          name: 'علي عماد خضير',
          phone: '0770 123 4567',
          district: 'الناصرية (الصالحية)',
          tribe: 'خفاجة / آل سعيد',
          keyAgent: 'أبو أحمد الخفاجي',
          status: 'مؤمّن (دعم كامل)',
          gps: '31.0583° N, 46.2575° E',
          lastContact: 'قبل يومين (زيارة ميدانية)'
        });
      }, 5500);

      return () => {
        clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      };
    }
  }, [currentSceneIdx]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentSceneIdx < SCENES.length - 1) {
      setCurrentSceneIdx(prev => prev + 1);
    } else {
      setCurrentSceneIdx(0);
    }
  };

  const handlePrev = () => {
    if (currentSceneIdx > 0) {
      setCurrentSceneIdx(prev => prev - 1);
    } else {
      setCurrentSceneIdx(SCENES.length - 1);
    }
  };

  const handleReset = () => {
    setCurrentSceneIdx(0);
    setIsPlaying(false);
    setProgress(0);
  };

  const handleCtaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ctaName && ctaPhone) {
      setCtaSubmitted(true);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-el-background text-el-text dir-rtl">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-el-surface p-6 rounded-xl border border-el-line shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-el-primary rounded-full animate-pulse"></span>
            <span className="text-[11px] font-bold text-el-primary uppercase tracking-wider">قسم الإعلام والإنتاج الفني</span>
          </div>
          <h2 className="text-2xl font-bold text-el-text mt-1 font-sans">مركز العرض التسويقي التفاعلي (Marketing Hub)</h2>
          <p className="text-xs text-el-muted mt-1 font-mono">
            نظام استعراض المشاهد التفاعلية ومخططات الفيديو التعريفي لمنصة إدارة الماكينة الانتخابية لمحافظة ذي قار
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex bg-el-surface-container p-1 rounded-lg border border-el-line shrink-0">
          <button
            onClick={() => setActiveTab('interactive')}
            className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'interactive' 
                ? 'bg-el-primary text-el-on-primary shadow' 
                : 'text-el-muted hover:text-el-text'
            }`}
          >
            <Tv className="w-4 h-4" />
            العرض التفاعلي
          </button>
          <button
            onClick={() => setActiveTab('full-script')}
            className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'full-script' 
                ? 'bg-el-primary text-el-on-primary shadow' 
                : 'text-el-muted hover:text-el-text'
            }`}
          >
            <FileText className="w-4 h-4" />
            السيناريو الكامل
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'guidelines' 
                ? 'bg-el-primary text-el-on-primary shadow' 
                : 'text-el-muted hover:text-el-text'
            }`}
          >
            <Info className="w-4 h-4" />
            دليل الإنتاج والمواصفات
          </button>
        </div>
      </div>

      {activeTab === 'interactive' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Visual Simulator (8 cols) */}
          <div className="lg:col-span-8 flex flex-col bg-el-surface rounded-xl border border-el-line overflow-hidden shadow-lg min-h-[500px]">
            {/* Header Simulator */}
            <div className="flex justify-between items-center bg-el-surface-container px-6 py-4 border-b border-el-line">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]"></span>
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
                <span className="w-3 h-3 rounded-full bg-[#27c93f]"></span>
                <span className="text-[11px] font-mono text-el-muted mr-2">simulator_screen_1080p.exe</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-el-primary bg-el-primary/10 px-3 py-1 rounded border border-el-primary/20">
                <Clock className="w-3.5 h-3.5" />
                <span>{currentScene.time}</span>
              </div>
            </div>

            {/* Live Visual Content Window */}
            <div className="flex-1 flex items-center justify-center p-8 bg-[#070b13] relative overflow-hidden min-h-[360px]">
              {/* Grid Background Effect */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                   style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

              <AnimatePresence mode="wait">
                {currentScene.id === 1 && (
                  <motion.div
                    key="scene-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex flex-col justify-center items-center text-center max-w-xl"
                  >
                    <div className="relative w-full h-32 flex justify-center items-center">
                      <div className="absolute w-2 h-2 bg-el-primary rounded-full animate-ping"></div>
                      <div className="absolute w-4 h-4 border border-el-primary/30 rounded-full animate-pulse"></div>
                      <div className="absolute w-32 h-[1px] bg-gradient-to-r from-transparent via-el-primary to-transparent animate-pulse"></div>
                      <div className="absolute w-[1px] h-32 bg-gradient-to-b from-transparent via-el-secondary to-transparent animate-pulse"></div>
                    </div>
                    
                    <motion.h3 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="text-2xl font-bold text-el-text mt-6 mb-2 tracking-wide font-sans leading-relaxed"
                    >
                      هل ما زلت تدير حملتك الانتخابية بالحدس والتخمين؟
                    </motion.h3>
                    
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.7 }}
                      transition={{ delay: 1.5 }}
                      className="text-xs text-el-muted font-mono"
                    >
                      [مقطع مشوق: نقاط بيانات ذهبية تتدفق على شاشة داكنة]
                    </motion.p>
                  </motion.div>
                )}

                {currentScene.id === 2 && (
                  <motion.div
                    key="scene-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-full max-w-sm bg-el-surface p-6 rounded-lg border border-el-line shadow-2xl relative"
                  >
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-el-primary-container text-el-primary rounded flex items-center justify-center mx-auto mb-2 border border-el-primary/20">
                        <Layers className="w-6 h-6" />
                      </div>
                      <h4 className="text-md font-bold text-el-text font-sans">بوابة الدخول الأمنية للمنظومة</h4>
                      <p className="text-[10px] text-el-muted mt-1 font-mono">الماكينة الانتخابية - محافظة ذي قار</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] text-el-muted block mb-1">اسم المستخدم</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            disabled
                            value={demoLoginState === 'typing-user' || demoLoginState === 'typing-pass' || demoLoginState === 'loading' || demoLoginState === 'success' ? 'admin' : ''} 
                            placeholder="username"
                            className="w-full bg-el-surface-container border border-el-line rounded px-3 py-2 text-xs font-mono text-el-text opacity-90"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-el-muted block mb-1">كلمة المرور</label>
                        <div className="relative">
                          <input 
                            type="password" 
                            disabled
                            value={demoLoginState === 'typing-pass' || demoLoginState === 'loading' || demoLoginState === 'success' ? '••••••••' : ''} 
                            placeholder="password"
                            className="w-full bg-el-surface-container border border-el-line rounded px-3 py-2 text-xs font-mono text-el-text opacity-90"
                          />
                        </div>
                      </div>

                      <button 
                        disabled
                        className={`w-full py-2.5 rounded text-xs font-bold transition-all flex justify-center items-center gap-2 ${
                          demoLoginState === 'success' 
                            ? 'bg-el-secondary text-el-on-secondary' 
                            : demoLoginState === 'loading' 
                              ? 'bg-el-primary/40 text-el-on-primary' 
                              : 'bg-el-primary text-el-on-primary'
                        }`}
                      >
                        {demoLoginState === 'loading' && <span className="w-3.5 h-3.5 border-2 border-el-on-primary border-t-transparent rounded-full animate-spin"></span>}
                        {demoLoginState === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {demoLoginState === 'success' ? 'تم الدخول بنجاح!' : demoLoginState === 'loading' ? 'جاري التحقق...' : 'تسجيل الدخول'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentScene.id === 3 && (
                  <motion.div
                    key="scene-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex flex-col gap-4 max-w-2xl"
                  >
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-el-surface p-3 rounded border border-el-line flex flex-col gap-1">
                        <span className="text-[10px] text-el-muted">إجمالي الناخبين</span>
                        <span className="text-md font-bold font-mono text-el-text text-left">154,230</span>
                        <div className="w-full bg-el-line h-1 rounded-full overflow-hidden mt-1">
                          <div className="bg-el-primary h-full w-[82%]"></div>
                        </div>
                      </div>
                      <div className="bg-el-surface p-3 rounded border border-el-line flex flex-col gap-1">
                        <span className="text-[10px] text-el-muted">نسبة المشاركة</span>
                        <span className="text-md font-bold font-mono text-el-secondary text-left">68.5%</span>
                        <div className="w-full bg-el-line h-1 rounded-full overflow-hidden mt-1">
                          <div className="bg-el-secondary h-full w-[68%]"></div>
                        </div>
                      </div>
                      <div className="bg-el-surface p-3 rounded border border-el-line flex flex-col gap-1">
                        <span className="text-[10px] text-el-muted">المقاعد المتوقعة</span>
                        <span className="text-md font-bold font-mono text-el-text text-left">7 مقاعد</span>
                      </div>
                      <div className="bg-el-surface p-3 rounded border border-el-line flex flex-col gap-1">
                        <span className="text-[10px] text-el-muted">الحالات المعلقة</span>
                        <span className="text-md font-bold font-mono text-el-error text-left">12 حالة</span>
                      </div>
                    </div>

                    <div className="bg-el-surface p-4 rounded border border-el-line flex-1 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-el-text">توزيع الدعم الجغرافي للناخبين (ذي قار)</span>
                      </div>
                      
                      <div className="flex-1 flex items-end justify-between gap-4 h-32 px-4 border-b border-el-line pb-2">
                        <div className="flex flex-col items-center gap-1 w-full">
                          <div className="bg-el-primary w-full rounded-t h-[80%] relative">
                            <span className="absolute -top-5 text-[9px] font-mono text-el-text w-full text-center">80%</span>
                          </div>
                          <span className="text-[9px] text-el-muted">الناصرية</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 w-full">
                          <div className="bg-el-secondary w-full rounded-t h-[65%] relative">
                            <span className="absolute -top-5 text-[9px] font-mono text-el-text w-full text-center">65%</span>
                          </div>
                          <span className="text-[9px] text-el-muted">الشطرة</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 w-full">
                          <div className="bg-el-primary w-full rounded-t h-[45%] relative">
                            <span className="absolute -top-5 text-[9px] font-mono text-el-text w-full text-center">45%</span>
                          </div>
                          <span className="text-[9px] text-el-muted">سوق الشيوخ</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 w-full">
                          <div className="bg-el-line w-full rounded-t h-[30%] relative">
                            <span className="absolute -top-5 text-[9px] font-mono text-el-text w-full text-center">30%</span>
                          </div>
                          <span className="text-[9px] text-el-muted">الرفاعي</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentScene.id === 4 && (
                  <motion.div
                    key="scene-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex gap-4 max-w-3xl"
                  >
                    <div className="flex-1 bg-el-surface p-4 rounded border border-el-line flex flex-col gap-3">
                      <div className="relative">
                        <input 
                          type="text" 
                          disabled
                          value={demoSearchText}
                          placeholder="ابحث عن ناخب..." 
                          className="w-full bg-el-surface-container border border-el-line rounded px-3 py-1.5 pr-8 text-xs text-el-text"
                        />
                        <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-el-muted" />
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-1.5 max-h-48 text-[11px]">
                        {demoVoters.length === 0 ? (
                          <div className="text-center text-el-muted py-6">جاري البحث في قاعدة البيانات...</div>
                        ) : (
                          demoVoters.map((voter, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`flex justify-between items-center p-2 rounded border transition-all ${
                                idx === 0 
                                  ? 'bg-el-primary/20 border-el-primary text-el-text' 
                                  : 'bg-el-surface-container border-el-line text-el-muted'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Users className="w-3.5 h-3.5" />
                                <span className="font-bold">{voter.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span>عشيرة {voter.tribe}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] ${
                                  voter.status === 'مؤمّن' ? 'bg-el-secondary/20 text-el-secondary' : 'bg-el-primary/25 text-el-primary'
                                }`}>
                                  {voter.status}
                                </span>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {demoVoterDetail && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-64 bg-el-surface-container p-4 rounded border border-el-line flex flex-col gap-3 text-[11px]"
                        >
                          <div className="border-b border-el-line pb-2">
                            <h5 className="font-bold text-el-text text-xs">{demoVoterDetail.name}</h5>
                            <p className="text-[10px] text-el-muted mt-0.5">{demoVoterDetail.phone}</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-el-muted">القضاء/المنطقة:</span>
                              <span className="text-el-text font-bold">{demoVoterDetail.district}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-el-muted">العشيرة/الحمولة:</span>
                              <span className="text-el-text font-bold">{demoVoterDetail.tribe}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-el-muted">المفتاح الانتخابي:</span>
                              <span className="text-el-primary font-bold">{demoVoterDetail.keyAgent}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-el-muted">تاريخ آخر اتصال:</span>
                              <span className="text-el-text">{demoVoterDetail.lastContact}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {currentScene.id === 5 && (
                  <motion.div
                    key="scene-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex flex-col gap-4 max-w-xl text-center"
                  >
                    <h4 className="text-xs font-bold text-el-text">لوحة المؤشرات التحليلية المتقدمة الذكية</h4>
                    
                    <div className="grid grid-cols-4 gap-4 mt-2">
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative w-16 h-16 rounded-full border-4 border-el-line flex items-center justify-center">
                          <span className="text-xs font-bold font-mono">84%</span>
                        </div>
                        <span className="text-[10px] text-el-muted">المؤشر العام</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative w-16 h-16 rounded-full border-4 border-el-line flex items-center justify-center">
                          <span className="text-xs font-bold font-mono">72%</span>
                        </div>
                        <span className="text-[10px] text-el-muted">توزيع الموارد</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative w-16 h-16 rounded-full border-4 border-el-line flex items-center justify-center">
                          <span className="text-xs font-bold font-mono">65%</span>
                        </div>
                        <span className="text-[10px] text-el-muted">المشاركة المتوقعة</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative w-16 h-16 rounded-full border-4 border-el-line flex items-center justify-center">
                          <span className="text-xs font-bold font-mono">90%</span>
                        </div>
                        <span className="text-[10px] text-el-muted">كفاءة المفاتيح</span>
                      </div>
                    </div>

                    <div className="bg-el-surface-container p-3 rounded border border-el-line text-[10px] font-mono text-right mt-4 space-y-1.5">
                      <div className="text-el-primary font-bold">💡 المنهجية الحسابية المعتمدة (EII & EFI)</div>
                      <div className="text-el-muted">
                        معادلة الكفاءة الانتخابية = 
                        <span className="text-el-text font-bold"> (الناخبين النشطين × درجة الولاء) / الميزانية الكلية للمنطقة</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentScene.id === 6 && (
                  <motion.div
                    key="scene-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex gap-6 max-w-2xl"
                  >
                    <div className="flex-1 flex flex-col justify-center items-center bg-el-surface p-4 rounded border border-el-line">
                      <span className="text-[10px] text-el-muted mb-4 block">توزيع مقاعد ذي قار (سانت ليغو 1.7)</span>
                      
                      <div className="grid grid-cols-5 gap-3 w-40 h-40">
                        {Array.from({ length: 15 }).map((_, idx) => {
                          let color = 'bg-el-line';
                          if (idx < 7) color = 'bg-el-primary'; 
                          else if (idx >= 7 && idx < 11) color = 'bg-el-secondary'; 
                          else if (idx >= 11 && idx < 14) color = 'bg-el-error'; 
                          return (
                            <motion.div 
                              key={idx}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-mono font-bold text-white ${color}`}
                            >
                              {idx + 1}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="w-64 bg-el-surface-container p-4 rounded border border-el-line flex flex-col gap-3 text-[11px]">
                      <h5 className="font-bold text-el-text border-b border-el-line pb-1.5">احتمالات المقاعد والقواسم</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-el-muted">القاسم الانتخابي المستهدف:</span>
                          <span className="text-el-text font-bold font-mono">1.7</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-el-muted">قائمتنا (المقاعد المتوقعة):</span>
                          <span className="text-el-primary font-bold font-mono">7 مقاعد (46.6%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-el-muted">المنافس الأول:</span>
                          <span className="text-el-secondary font-bold font-mono">4 مقاعد</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentScene.id === 7 && (
                  <motion.div
                    key="scene-7"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex gap-4 max-w-3xl"
                  >
                    <div className="flex-1 bg-el-surface p-4 rounded border border-el-line flex flex-col gap-2">
                      <span className="text-[10px] text-el-muted">قوة الدعم حسب العشائر (ذي قار)</span>
                      <div className="space-y-2 text-[10px]">
                        <div className="bg-el-surface-container p-2 rounded border border-el-line">
                          <div className="flex justify-between font-bold mb-1">
                            <span>عشيرة خفاجة</span>
                            <span className="text-el-secondary">82% دعم متوقع</span>
                          </div>
                        </div>
                        <div className="bg-el-surface-container p-2 rounded border border-el-line">
                          <div className="flex justify-between font-bold mb-1">
                            <span>عشيرة بني ركاب</span>
                            <span className="text-el-primary">70% دعم متوقع</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 bg-el-surface p-4 rounded border border-el-line flex flex-col gap-2">
                      <span className="text-[10px] text-el-muted">تقييم كفاءة المفاتيح الميدانية</span>
                      <div className="space-y-2 text-[10px]">
                        <div className="bg-el-surface-container p-2 rounded border border-el-line flex justify-between items-center">
                          <div>
                            <span className="font-bold block">أبو أحمد الخفاجي</span>
                            <span className="text-[9px] text-el-muted">الناصرية (120 ناخب)</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-el-secondary/20 text-el-secondary font-bold">ولاء عالي</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentScene.id === 8 && (
                  <motion.div
                    key="scene-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex flex-col gap-4 max-w-xl"
                  >
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-el-surface p-3 rounded border border-el-line flex flex-col">
                        <span className="text-[9px] text-el-muted">إجمالي الميزانية المرصودة</span>
                        <span className="text-sm font-bold font-mono text-el-text text-left mt-1">45,000,000 د.ع</span>
                      </div>
                      <div className="bg-el-surface p-3 rounded border border-el-line flex flex-col">
                        <span className="text-[9px] text-el-muted">العائد الإجمالي (ROI)</span>
                        <span className="text-sm font-bold font-mono text-el-secondary text-left mt-1">7.4x أضعاف</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentScene.id === 9 && (
                  <motion.div
                    key="scene-9"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex flex-col gap-4 max-w-xl text-center justify-center"
                  >
                    <h4 className="text-xs font-bold text-el-text">لوحة تصدير التقارير الفورية للمرشحين</h4>
                    
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="bg-el-surface p-4 rounded border border-el-line hover:border-el-primary transition-all flex flex-col items-center gap-2">
                        <FileText className="w-8 h-8 text-el-primary" />
                        <span className="text-[10px] font-bold text-el-text">تقرير المشاركة PDF</span>
                      </div>
                      <div className="bg-el-surface p-4 rounded border border-el-line hover:border-el-primary transition-all flex flex-col items-center gap-2">
                        <FileSpreadsheet className="w-8 h-8 text-el-secondary" />
                        <span className="text-[10px] font-bold text-el-text">مؤشرات الأداء Excel</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentScene.id === 10 && (
                  <motion.div
                    key="scene-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex flex-col justify-center items-center text-center max-w-md bg-[#090e18] p-6 rounded-xl border border-el-primary/40 relative shadow-2xl"
                  >
                    <div className="w-12 h-12 bg-el-primary-container text-el-primary rounded-full flex items-center justify-center border border-el-primary/20 mb-4">
                      <Layers className="w-6 h-6" />
                    </div>

                    <h3 className="text-xl font-bold text-el-text font-sans">تواصل معنا اليوم لحجز موعد</h3>
                    
                    {ctaSubmitted ? (
                      <div className="mt-6 p-4 bg-el-secondary/20 border border-el-secondary rounded-lg text-el-secondary text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تم تقديم طلبك بنجاح! سيتصل بك فريقنا الفني قريباً.</span>
                      </div>
                    ) : (
                      <form onSubmit={handleCtaSubmit} className="mt-6 w-full space-y-3">
                        <input 
                          type="text" 
                          required
                          value={ctaName}
                          onChange={(e) => setCtaName(e.target.value)}
                          placeholder="اسم المرشح أو الائتلاف" 
                          className="w-full bg-el-surface border border-el-line rounded px-3 py-2 text-xs text-el-text text-right"
                        />
                        <input 
                          type="text" 
                          required
                          value={ctaPhone}
                          onChange={(e) => setCtaPhone(e.target.value)}
                          placeholder="رقم الهاتف للتواصل" 
                          className="w-full bg-el-surface border border-el-line rounded px-3 py-2 text-xs text-el-text text-left font-mono"
                        />
                        <button 
                          type="submit" 
                          className="w-full bg-el-primary text-el-on-primary py-2 rounded text-xs font-bold hover:opacity-90 transition-all cursor-pointer active:scale-95"
                        >
                          حجز عرض تجريبي مخصص
                        </button>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Video Controller Section */}
            <div className="bg-el-surface-container px-6 py-4 border-t border-el-line flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrev}
                  className="bg-el-surface text-el-text p-2 rounded border border-el-line hover:bg-el-surface-container-highest cursor-pointer transition-all active:scale-95"
                  title="المشهد السابق"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePlayPause}
                  className="bg-el-primary text-el-on-primary p-2.5 rounded-full hover:opacity-90 cursor-pointer transition-all active:scale-95"
                  title={isPlaying ? "إيقاف مؤقت" : "تشغيل تلقائي للعرض"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button
                  onClick={handleNext}
                  className="bg-el-surface text-el-text p-2 rounded border border-el-line hover:bg-el-surface-container-highest cursor-pointer transition-all active:scale-95"
                  title="المشهد التالي"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleReset}
                  className="bg-el-surface text-el-muted p-2 rounded border border-el-line hover:bg-el-surface-container-highest cursor-pointer transition-all active:scale-95"
                  title="إعادة تشغيل"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 w-full max-w-xs md:max-w-md flex items-center gap-3">
                <span className="text-[10px] text-el-muted font-mono">{Math.floor((progress/100) * currentScene.duration)}ث</span>
                <div className="flex-1 bg-el-line h-2 rounded-full overflow-hidden relative">
                  <div 
                    className="bg-el-primary h-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-el-muted font-mono">{currentScene.duration}ث</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-el-muted">السرعة:</span>
                <button
                  onClick={() => setPlaybackSpeed(1)}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition-all ${
                    playbackSpeed === 1 
                      ? 'bg-el-primary/20 border-el-primary text-el-primary' 
                      : 'border-el-line text-el-muted'
                  }`}
                >
                  1.0x
                </button>
                <button
                  onClick={() => setPlaybackSpeed(2)}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition-all ${
                    playbackSpeed === 2 
                      ? 'bg-el-primary/20 border-el-primary text-el-primary' 
                      : 'border-el-line text-el-muted'
                  }`}
                >
                  2.0x
                </button>
              </div>
            </div>
          </div>

          {/* Storyboard Script Details (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-el-surface p-6 rounded-xl border border-el-line flex flex-col gap-4 shadow-lg">
              <div className="border-b border-el-line pb-3">
                <div className="text-[10px] font-bold text-el-primary font-mono uppercase">المشهد الحالي {currentScene.id} من 10</div>
                <h3 className="text-md font-bold text-el-text mt-1 font-sans">{currentScene.title}</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-el-surface-container p-4 rounded-lg border border-el-line relative">
                  <div className="absolute top-2 right-2 text-el-muted">
                    <Volume2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[10px] font-bold text-el-primary mr-5 mb-1.5">التعليق الصوتي (الراوي):</div>
                  <p className="text-xs text-el-text leading-relaxed text-right font-sans">
                    "{currentScene.voiceover}"
                  </p>
                </div>

                <div className="text-xs">
                  <div className="font-bold text-el-text mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-el-secondary rounded-full"></span>
                    الوصف البصري واللقطة:
                  </div>
                  <p className="text-el-muted leading-relaxed text-right">
                    {currentScene.visualDescription}
                  </p>
                </div>

                <div className="text-xs bg-el-primary/5 p-3 rounded border border-el-primary/10">
                  <div className="font-bold text-el-primary mb-1">الهدف التسويقي للمشهد:</div>
                  <p className="text-el-muted leading-relaxed text-right">
                    {currentScene.actionText}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-el-surface p-4 rounded-xl border border-el-line shadow-lg">
              <span className="text-[10px] font-bold text-el-muted block mb-3">فهرس المشاهد السريع</span>
              <div className="grid grid-cols-5 gap-2">
                {SCENES.map((scene, idx) => (
                  <button
                    key={scene.id}
                    onClick={() => {
                      setCurrentSceneIdx(idx);
                      setProgress(0);
                    }}
                    className={`h-9 rounded font-mono text-xs font-bold transition-all cursor-pointer ${
                      currentSceneIdx === idx 
                        ? 'bg-el-primary text-el-on-primary border border-el-primary' 
                        : 'bg-el-surface-container text-el-muted border border-el-line hover:text-el-text'
                    }`}
                  >
                    {scene.id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'full-script' && (
        <div className="bg-el-surface p-6 rounded-xl border border-el-line shadow-lg overflow-x-auto">
          <div className="flex justify-between items-center border-b border-el-line pb-4 mb-4">
            <h3 className="text-lg font-bold text-el-text font-sans">السيناريو الكامل والجدول الزمني المخطط للمشاهد</h3>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-el-surface-container border border-el-line text-el-text px-3 py-1.5 rounded text-xs font-bold hover:bg-el-surface-container-highest cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              طباعة أو تصدير السيناريو
            </button>
          </div>
          
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-el-surface-container text-el-text font-bold border-b border-el-line">
                <th className="p-3 w-16 text-center">المشهد</th>
                <th className="p-3 w-40">عنوان المشهد والتوقيت</th>
                <th className="p-3 w-48">اللقطة والوصف البصري</th>
                <th className="p-3">التعليق الصوتي (الراوي)</th>
                <th className="p-3 w-36">الهدف والأثر الإقناعي</th>
              </tr>
            </thead>
            <tbody>
              {SCENES.map((scene) => (
                <tr key={scene.id} className="border-b border-el-line hover:bg-el-surface-container/50">
                  <td className="p-3 text-center font-mono font-bold text-el-primary">{scene.id}</td>
                  <td className="p-3">
                    <span className="font-bold block text-el-text font-sans">{scene.title}</span>
                    <span className="font-mono text-el-secondary text-[10px] block mt-1">{scene.time} ({scene.duration} ثوانٍ)</span>
                  </td>
                  <td className="p-3 text-el-muted leading-relaxed">{scene.visualDescription}</td>
                  <td className="p-3 text-el-text leading-relaxed font-sans font-medium">"{scene.voiceover}"</td>
                  <td className="p-3 text-el-primary font-medium">{scene.actionText}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'guidelines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-el-surface p-6 rounded-xl border border-el-line shadow-lg space-y-4">
            <h3 className="text-md font-bold text-el-text border-b border-el-line pb-2 font-sans">🛠️ متطلبات وأدوات الإنتاج (Production Toolkit)</h3>
            
            <div className="space-y-3 text-xs leading-relaxed text-el-muted">
              <div>
                <strong className="text-el-text block mb-1">1. برمجيات تسجيل الشاشة المقترحة:</strong>
                أداة <span className="text-el-primary">OBS Studio</span> أو <span className="text-el-primary">Camtasia</span> مع ضبط معدل الإطارات إلى 60 إطاراً في الثانية.
              </div>
              <div>
                <strong className="text-el-text block mb-1">2. أبعاد ودقة التسجيل:</strong>
                دقة <span className="text-el-text font-bold font-mono">1920 × 1080 (Full HD)</span> بنسبة أبعاد 16:9.
              </div>
              <div>
                <strong className="text-el-text block mb-1">3. إعدادات مؤشر الفأرة:</strong>
                تلوين مؤشر الفأرة بدائرة صفراء شفافة لمساعدة عين المشاهد على تتبع حركة الضغط.
              </div>
            </div>
          </div>

          <div className="bg-el-surface p-6 rounded-xl border border-el-line shadow-lg space-y-4">
            <h3 className="text-md font-bold text-el-text border-b border-el-line pb-2 font-sans">📋 إرشادات تجهيز بيانات المحاكاة (Demo Data Setup)</h3>
            
            <div className="space-y-3 text-xs leading-relaxed text-el-muted">
              <div className="p-3 bg-el-primary/5 rounded border border-el-primary/10 text-el-primary">
                <span className="font-bold block">⚠️ تنبيه أمني وحماية بيانات حية:</span>
                تجنب تماماً استخدام بيانات ناخبين حقيقية أو هواتف صحيحة لمواطني محافظة ذي قار أثناء تسجيل الشاشة للامتثال لقواعد حماية البيانات.
              </div>
              
              <div>
                <strong className="text-el-text block mb-1">خطوات تعبئة قاعدة بيانات تجريبية:</strong>
                1. استخدم ملف تفعيل البيانات الافتراضية المدمج في النظام لتهيئة قاعدة بيانات تجريبية خالية من البيانات الحقيقية.
                <br />
                2. قم بتسجيل 10 إلى 15 اسماً وهمياً للناخبين موزعين على الأقضية لإظهار الفلترة بكفاءة.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
