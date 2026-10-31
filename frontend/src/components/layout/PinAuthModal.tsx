import React, { useState } from 'react';
import { X, Lock, Delete, ShieldAlert } from 'lucide-react';

interface PinAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PinAuthModal: React.FC<PinAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const MANAGER_PIN = '1234';

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(null);

      // Auto-validate when 4 digits entered
      if (newPin.length === 4) {
        if (newPin === MANAGER_PIN) {
          setTimeout(() => {
            setPin('');
            setError(null);
            onSuccess();
          }, 200);
        } else {
          setTimeout(() => {
            setError('Invalid Manager PIN. Try 1234');
            setPin('');
          }, 200);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm text-white">Manager Access</span>
          </div>

          <button
            onClick={() => {
              handleClear();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 text-center mb-6">
          Enter 4-digit Manager PIN to unlock settings
        </p>

        {/* PIN Dots Display */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-orange-500 scale-125 shadow-md shadow-orange-500/40'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Error Feedback */}
        {error ? (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 mb-4 animate-shake">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="h-6 mb-4 flex items-center">
            <span className="text-[11px] text-slate-500 font-medium">
              Demo PIN: <strong className="text-slate-400 font-mono">1234</strong>
            </span>
          </div>
        )}

        {/* Touch-Friendly Numpad Grid */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[240px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="h-14 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-lg font-bold text-slate-200 hover:text-white active:scale-95 transition-all shadow-sm flex items-center justify-center font-mono"
            >
              {digit}
            </button>
          ))}

          <button
            onClick={handleClear}
            className="h-14 rounded-2xl bg-slate-950/40 hover:bg-slate-800/60 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center uppercase tracking-wider"
          >
            Clear
          </button>

          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-lg font-bold text-slate-200 hover:text-white active:scale-95 transition-all shadow-sm flex items-center justify-center font-mono"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-950/40 hover:bg-slate-800/60 text-slate-400 hover:text-rose-400 transition-colors flex items-center justify-center"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

