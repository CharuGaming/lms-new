'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  loading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone. This will permanently delete the content from our servers.",
  loading = false
}: DeleteConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md pointer-events-auto rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(15, 15, 30, 0.95), rgba(5, 5, 10, 0.98))' }}
            >
              {/* Header Decorative Bar */}
              <div className="h-1 w-full bg-gradient-to-r from-red-500/20 via-red-500 to-red-500/20" />

              <div className="p-8">
                {/* Icon Wrapper */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                    <AlertTriangle size={32} className="text-red-500" />
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {message}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3.5 rounded-2xl text-xs font-bold transition-all hover:bg-white/5 border border-white/5 bg-white/3"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex-1 py-3.5 rounded-2xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                        <Trash2 size={14} />
                      </motion.div>
                    ) : (
                      <Trash2 size={14} />
                    )}
                    {loading ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl text-white/20 hover:text-white hover:bg-white/5 transition-all"
              >
                <X size={18} />
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
