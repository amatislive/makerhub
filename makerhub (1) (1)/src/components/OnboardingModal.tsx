import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  QrCode,
  ArrowRightLeft,
  Printer,
  FileCode2,
  FolderKanban,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Compass,
  Cpu,
  Boxes
} from 'lucide-react';
import { NavView } from './Navigation';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: NavView) => void;
}

const ONBOARDING_STEPS = [
  {
    title: 'WELCOME TO MAKEO DIGITAL WORKSHOP',
    subtitle: 'THE ULTIMATE HARDWARE & MAKER BENCH',
    tagline: 'EVERYTHING YOU NEED FROM IDEA TO PHYSICAL BUILD',
    icon: Sparkles,
    color: '#fe5029',
    description:
      'MAKEO is an all-in-one digital workshop combining virtual circuit breadboarding, SPICE simulation, firmware code generation, 3D slicing, parts inventory with QR labeling, and engineering unit conversion in a single unified workspace.',
    highlights: [
      'Interactive Breadboard & Real-Time SPICE Electronics Lab',
      'QR Code Maker for Component Bins & Workshop Assets',
      'Engineering Unit Converter with Resistor Decoders & AWG Tables',
      'AI Firmware Copilot & 3D Print Slice Manager',
    ],
    targetView: 'dashboard' as NavView,
    actionLabel: 'START TOUR',
  },
  {
    title: 'CIRCUIT LAB & VIRTUAL BENCH',
    subtitle: 'DRAG • PLACE • WIRE • SIMULATE • INSPECT',
    tagline: 'INTERACTIVE ELECTRONICS SIMULATION',
    icon: Zap,
    color: '#fe5029',
    description:
      'Design schematics and wire breadboards with microcontrollers (Arduino, ESP32, Raspberry Pi Pico), sensors, actuators, and analog components. Run live oscilloscope probes, multi-meters, and test logic before you solder.',
    highlights: [
      'Virtual Breadboard with dynamic wire routing & junction snapping',
      'Interactive Oscilloscope, Multimeter & Logic Analyzer probes',
      'Real-time SPICE circuit simulation engine with live voltage readings',
      'Live Microcontroller firmware emulator and GPIO pinout map',
    ],
    targetView: 'circuits' as NavView,
    actionLabel: 'EXPLORE CIRCUIT LAB',
  },
  {
    title: 'QR CODE MAKER & BIN LABELS',
    subtitle: 'VECTOR QR CODES & PRINTABLE INVENTORY STICKERS',
    tagline: 'ORGANIZATION & HARDWARE ASSET TRACKING',
    icon: QrCode,
    color: '#111111',
    description:
      'Generate high-precision QR codes for your maker space. Batch-generate printable bin labels directly from your component inventory with part numbers, drawer locations, and specs. Export to vector SVG or high-res PNG.',
    highlights: [
      'Multiple QR Archetypes: Inventory, Wi-Fi credentials, URLs, Device tags',
      'Batch Generator: Generate stickers for entire storage drawers at once',
      'Custom Brand Colors & Error Correction (L, M, Q, H)',
      '1-Click Print Layouts formatted for standard thermal label makers',
    ],
    targetView: 'qr' as NavView,
    actionLabel: 'OPEN QR MAKER',
  },
  {
    title: 'ENGINEERING UNIT CHANGER',
    subtitle: 'OHMS, RESISTOR CODES, AWG, 3D FLOW & TORQUE',
    tagline: 'INSTANT HARDWARE CALCULATOR MATRIX',
    icon: ArrowRightLeft,
    color: '#75f76e',
    description:
      'Never get stuck converting units or looking up tables again. Includes live Ohm’s law solver, 4/5-band resistor color decoder, SMD EIA-96 chip reader, AWG wire gauge current capacity table, and 3D printing volumetric flow calculator.',
    highlights: [
      '4-Band & 5-Band Resistor Band Visual Color Decoder',
      'SMD 3-Digit, 4-Digit & EIA-96 Code Identifier',
      'AWG Wire Gauge to mm² and Max Chassis Current rating',
      '3D Printing Volumetric Extrusion Speed (mm³/s) & NEMA Stepper Torque',
    ],
    targetView: 'units' as NavView,
    actionLabel: 'LAUNCH UNIT CHANGER',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if first visit
    const hasSeen = localStorage.getItem('makeo_onboarding_completed');
    if (!hasSeen && isOpen === false) {
      // Allow parent control
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('makeo_onboarding_completed', 'true');
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleJumpToFeature = () => {
    localStorage.setItem('makeo_onboarding_completed', 'true');
    onNavigate(step.targetView);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/70 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white border-2 border-[#111111] shadow-[8px_8px_0px_#111111] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="bg-[#111111] text-white p-3.5 flex items-center justify-between border-b border-[#111111]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#fe5029] text-white flex items-center justify-center font-bold text-xs border border-white">
              M
            </div>
            <span className="font-mono-tech text-xs font-bold tracking-widest text-[#fe5029] uppercase">
              WORKSHOP ONBOARDING // STEP {currentStep + 1} OF {ONBOARDING_STEPS.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-[#333333] text-white"
            title="Close tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Content */}
        <div className="p-6 sm:p-8 space-y-6 flex-1">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 border-2 border-[#111111] bg-white flex items-center justify-center shrink-0 shadow-[3px_3px_0px_#111111]"
              style={{ borderColor: '#111111' }}
            >
              <StepIcon className="w-7 h-7 text-[#fe5029]" />
            </div>

            <div className="flex-1">
              <span className="inline-block px-2 py-0.5 bg-[#f7e96e] border border-[#111111] font-mono-tech text-[9px] font-black uppercase text-[#111111] mb-1">
                {step.tagline}
              </span>
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#111111] tracking-tight leading-tight">
                {step.title}
              </h2>
              <p className="font-mono-tech text-xs text-[#fe5029] font-bold mt-0.5">
                {step.subtitle}
              </p>
            </div>
          </div>

          <p className="font-mono-tech text-xs sm:text-sm text-[#111111]/80 leading-relaxed border-l-2 border-[#111111] pl-3 py-1 bg-[#f9f9f9]">
            {step.description}
          </p>

          {/* Key Highlights Checklist */}
          <div className="space-y-2">
            <span className="font-mono-tech text-[10px] font-bold text-[#111111]/60 uppercase tracking-wider block">
              // CORE CAPABILITIES
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {step.highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 border border-[#eeeeee] bg-[#fdfdfd] font-mono-tech text-xs text-[#111111]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#fe5029] shrink-0" />
                  <span className="truncate">{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-[#eeeeee]/60 border-t border-[#111111] flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5">
            {ONBOARDING_STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`h-2 transition-all ${
                  idx === currentStep
                    ? 'w-8 bg-[#fe5029] border border-[#111111]'
                    : 'w-3 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-1.5 border border-[#111111] bg-white hover:bg-[#eeeeee] font-mono-tech text-xs font-bold uppercase flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                PREV
              </button>
            )}

            <button
              type="button"
              onClick={handleJumpToFeature}
              className="px-3 py-1.5 border border-[#111111] bg-[#f7e96e] hover:bg-[#e4d65c] font-mono-tech text-xs font-bold uppercase text-[#111111] shadow-[2px_2px_0px_#111111]"
            >
              {step.actionLabel}
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-1.5 border border-[#111111] bg-[#111111] text-white hover:bg-[#333333] font-mono-tech text-xs font-bold uppercase flex items-center gap-1 shadow-[2px_2px_0px_#fe5029]"
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? 'GET STARTED' : 'NEXT'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
