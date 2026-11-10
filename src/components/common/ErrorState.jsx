'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertTriangle, AlertCircle, RefreshCw, Compass, ArrowLeft, Home } from 'lucide-react'

/**
 * Universal ErrorState Component
 * 
 * @param {'fullscreen' | 'section' | 'inline'} variant - Layout style
 * @param {string} title - Heading text
 * @param {string} message - Subtitle or error details
 * @param {string} [badge] - Optional pill badge (e.g. "404 Not Found" or "Network Error")
 * @param {React.ComponentType} [icon] - Custom Lucide icon component
 * @param {Function} [onRetry] - Callback when user clicks "Try Again"
 * @param {string} [retryText] - Label for retry button (default: "Try Again")
 * @param {boolean} [isRetrying] - Shows spinner on retry button
 * @param {{ label: string, href?: string, onClick?: Function, icon?: React.ComponentType }} [primaryAction] - Primary action button
 * @param {{ label: string, href?: string, onClick?: Function, icon?: React.ComponentType }} [secondaryAction] - Secondary action button
 * @param {string} [className] - Additional classes
 */
export function ErrorState({
  variant = 'section',
  title = 'Something Went Wrong',
  message = 'An unexpected error occurred. Please try again or check back shortly.',
  badge,
  icon: CustomIcon,
  onRetry,
  retryText = 'Try Again',
  isRetrying = false,
  primaryAction,
  secondaryAction,
  className = '',
}) {
  const Icon = CustomIcon || (variant === 'fullscreen' ? AlertTriangle : AlertCircle)

  if (variant === 'fullscreen') {
    return (
      <div className={`min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-neutral-50 dark:bg-dark-900 transition-colors ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="max-w-lg w-full flex flex-col items-center"
        >
          {/* Visual Icon Badge */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-3xl bg-red-100/80 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/50 flex items-center justify-center text-red-500 dark:text-red-400 shadow-xl shadow-red-500/10">
              <Icon size={44} strokeWidth={1.8} />
            </div>
            <div className="absolute -inset-2 rounded-3xl bg-red-500/10 blur-xl -z-10 pointer-events-none" />
          </div>

          {badge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 mb-3 border border-red-200/60 dark:border-red-800/40">
              {badge}
            </span>
          )}

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-3 tracking-tight">
            {title}
          </h1>

          <p className="text-neutral-600 dark:text-neutral-400 text-base leading-relaxed mb-8 max-w-md">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-center">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                disabled={isRetrying}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 active:scale-98 text-white font-semibold text-sm transition-all shadow-md shadow-primary-500/20 disabled:opacity-60 cursor-pointer"
              >
                <RefreshCw size={16} className={isRetrying ? 'animate-spin' : ''} />
                <span>{isRetrying ? 'Retrying…' : retryText}</span>
              </button>
            )}

            {primaryAction && (
              primaryAction.href ? (
                <Link
                  href={primaryAction.href}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 active:scale-98 text-white font-semibold text-sm transition-all shadow-md shadow-primary-500/20"
                >
                  {primaryAction.icon ? <primaryAction.icon size={16} /> : <Compass size={16} />}
                  <span>{primaryAction.label}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={primaryAction.onClick}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 active:scale-98 text-white font-semibold text-sm transition-all shadow-md shadow-primary-500/20 cursor-pointer"
                >
                  {primaryAction.icon ? <primaryAction.icon size={16} /> : <Compass size={16} />}
                  <span>{primaryAction.label}</span>
                </button>
              )
            )}

            {secondaryAction && (
              secondaryAction.href ? (
                <Link
                  href={secondaryAction.href}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-neutral-300 dark:border-dark-600 bg-white dark:bg-dark-800 hover:bg-neutral-100 dark:hover:bg-dark-700 text-neutral-700 dark:text-neutral-200 font-semibold text-sm transition-all active:scale-98 shadow-sm"
                >
                  {secondaryAction.icon ? <secondaryAction.icon size={16} /> : <Home size={16} />}
                  <span>{secondaryAction.label}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={secondaryAction.onClick}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-neutral-300 dark:border-dark-600 bg-white dark:bg-dark-800 hover:bg-neutral-100 dark:hover:bg-dark-700 text-neutral-700 dark:text-neutral-200 font-semibold text-sm transition-all active:scale-98 shadow-sm cursor-pointer"
                >
                  {secondaryAction.icon ? <secondaryAction.icon size={16} /> : <ArrowLeft size={16} />}
                  <span>{secondaryAction.label}</span>
                </button>
              )
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50/70 dark:bg-red-950/20 p-5 text-left transition-all ${className}`}>
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 shrink-0">
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="text-sm font-bold text-red-900 dark:text-red-200 mb-1 leading-snug">
                {title}
              </h4>
            )}
            <p className="text-xs text-red-700 dark:text-red-300/90 leading-relaxed">
              {message}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                disabled={isRetrying}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 underline underline-offset-2 transition-colors cursor-pointer"
              >
                <RefreshCw size={12} className={isRetrying ? 'animate-spin' : ''} />
                <span>{isRetrying ? 'Retrying…' : retryText}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // variant === 'section' (Default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`w-full text-center py-12 px-6 sm:px-10 rounded-3xl border border-neutral-200/80 dark:border-dark-700 bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm shadow-sm ${className}`}
    >
      <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center justify-center text-red-500 dark:text-red-400 mb-4 shadow-sm">
        <Icon size={26} strokeWidth={1.8} />
      </div>

      {badge && (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 mb-2">
          {badge}
        </span>
      )}

      <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6 leading-relaxed">
        {message}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 active:scale-98 text-white font-semibold text-xs transition-all shadow-sm shadow-primary-500/20 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw size={14} className={isRetrying ? 'animate-spin' : ''} />
            <span>{isRetrying ? 'Retrying…' : retryText}</span>
          </button>
        )}

        {primaryAction && (
          primaryAction.href ? (
            <Link
              href={primaryAction.href}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs transition-all shadow-sm"
            >
              {primaryAction.icon ? <primaryAction.icon size={14} /> : <Compass size={14} />}
              <span>{primaryAction.label}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
            >
              {primaryAction.icon ? <primaryAction.icon size={14} /> : <Compass size={14} />}
              <span>{primaryAction.label}</span>
            </button>
          )
        )}

        {secondaryAction && (
          secondaryAction.href ? (
            <Link
              href={secondaryAction.href}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-dark-600 bg-white dark:bg-dark-800 hover:bg-neutral-50 dark:hover:bg-dark-700 text-neutral-700 dark:text-neutral-300 font-semibold text-xs transition-all"
            >
              {secondaryAction.icon ? <secondaryAction.icon size={14} /> : <Home size={14} />}
              <span>{secondaryAction.label}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-dark-600 bg-white dark:bg-dark-800 hover:bg-neutral-50 dark:hover:bg-dark-700 text-neutral-700 dark:text-neutral-300 font-semibold text-xs transition-all cursor-pointer"
            >
              {secondaryAction.icon ? <secondaryAction.icon size={14} /> : <ArrowLeft size={14} />}
              <span>{secondaryAction.label}</span>
            </button>
          )
        )}
      </div>
    </motion.div>
  )
}

export default ErrorState

