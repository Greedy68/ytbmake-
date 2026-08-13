import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PayPalModal: React.FC = () => {
  const { activePayPalLesson, setActivePayPalLesson, processPayPalPayment, setActiveLesson } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!activePayPalLesson) return null;

  const handlePayWithPayPal = async () => {
    setIsProcessing(true);
    const success = await processPayPalPayment(activePayPalLesson);
    setIsProcessing(false);
    
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        const unlockedLesson = activePayPalLesson;
        setActivePayPalLesson(null);
        // Automatically open lesson video player after payment
        setActiveLesson(unlockedLesson);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#001848] border border-blue-400/40 rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#003087] border-b border-blue-400/20">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center">
              Pay<span className="text-[#009cde]">Pal</span>
            </span>
            <span className="text-xs bg-blue-500/20 text-blue-200 px-2 py-0.5 rounded font-mono border border-blue-400/30">
              Checkout Sandbox
            </span>
          </div>
          <button
            onClick={() => setActivePayPalLesson(null)}
            className="p-1 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {isSuccess ? (
            <div className="py-8 text-center space-y-4 animate-scale-up">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
              <div>
                <h3 className="text-xl font-bold text-white">Thanh Toán Thành Công!</h3>
                <p className="text-xs text-blue-200 mt-1">Đã mở khóa toàn bộ quyền xem video bài học.</p>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                Mã giao dịch: <strong>PAYPAL_{Math.random().toString(36).substring(2, 8).toUpperCase()}</strong>
              </div>
            </div>
          ) : (
            <>
              {/* Order Summary */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-4">
                <img
                  src={activePayPalLesson.thumbnailUrl}
                  alt={activePayPalLesson.title}
                  className="w-20 h-14 object-cover rounded-lg border border-amber-500/50 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    {activePayPalLesson.moduleTitle}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate">{activePayPalLesson.title}</h4>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-blue-200">Thời lượng: {activePayPalLesson.duration}</span>
                    <span className="text-sm font-extrabold text-[#fabb15]">${activePayPalLesson.price.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs text-blue-100 border-t border-b border-white/10 py-3">
                <div className="flex justify-between">
                  <span>Giá bài học / khóa học:</span>
                  <span>${activePayPalLesson.price.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí xử lý cổng PayPal:</span>
                  <span className="text-emerald-400 font-semibold">Miễn phí ($0.00)</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-white/10">
                  <span>Tổng thanh toán:</span>
                  <span className="text-xl text-[#fabb15]">${activePayPalLesson.price.toFixed(2)} USD</span>
                </div>
              </div>

              {/* PayPal Payment Button */}
              <div className="space-y-3">
                <button
                  onClick={handlePayWithPayPal}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-4 bg-[#ffc439] hover:bg-[#f2ba32] text-[#003087] font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang kết nối cổng PayPal...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg font-black italic tracking-tighter">Pay<span className="text-[#0079c1]">Pal</span></span>
                      <span className="text-sm">Thanh Toán Ngay với PayPal</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-blue-200/80">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Bảo mật 256-bit SSL | Xử lý thanh toán tức thì</span>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
