'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react'
import { PlaceImage } from '@/components/common/PlaceImage'

export function PlaceCarousel({ images, name }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)

  if (!images || images.length === 0) {
    return (
      <div className="h-72 sm:h-96 rounded-2xl bg-neutral-100 dark:bg-dark-800 flex flex-col items-center justify-center gap-3 border border-neutral-200 dark:border-dark-700">
        <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-dark-700 flex items-center justify-center">
          <Maximize2 size={24} className="text-neutral-400" />
        </div>
        <p className="text-sm text-neutral-500">No images available for this place.</p>
      </div>
    )
  }

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length)
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFullscreen) {
        if (e.key === 'ArrowRight') next()
        if (e.key === 'ArrowLeft') prev()
        if (e.key === 'Escape') { setIsFullscreen(false); setZoom(1) }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  return (
    <div className="relative group">
      {/* Main Display */}
      <div className="relative h-72 sm:h-[450px] rounded-2xl overflow-hidden bg-neutral-900 shadow-xl border border-neutral-200 dark:border-dark-700">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <PlaceImage
              src={images[currentIndex]}
              alt={`${name} - ${currentIndex + 1}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); prev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); next() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Fullscreen Trigger */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all flex items-center gap-2 text-xs font-bold"
        >
          <Maximize2 size={16} />
          <span>VIEW FULLSCREEN</span>
        </button>

        {/* Counter */}
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md text-white text-[10px] font-bold tracking-widest">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 hide-scrollbar">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                currentIndex === i ? 'border-primary-500 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <PlaceImage src={img} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4"
          >
            {/* Header Controls */}
            <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
              <div className="text-white">
                <h4 className="font-serif font-bold text-lg">{name}</h4>
                <p className="text-xs text-neutral-400">Photo {currentIndex + 1} of {images.length}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white/10 rounded-xl p-1 backdrop-blur-md">
                  <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors">
                    <ZoomOut size={18} />
                  </button>
                  <span className="text-[10px] font-bold text-white w-12 text-center">{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors">
                    <ZoomIn size={18} />
                  </button>
                  <button onClick={() => setZoom(1)} className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors border-l border-white/10 ml-1">
                    <RefreshCw size={14} />
                  </button>
                </div>
                <button
                  onClick={() => { setIsFullscreen(false); setZoom(1) }}
                  className="p-2 rounded-full bg-white/10 hover:bg-red-500/80 text-white backdrop-blur-md transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Main Image in Modal */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <motion.div
                key={currentIndex}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.1}
                animate={{ scale: zoom }}
                transition={{ type: 'spring', damping: 20, stiffness: 150 }}
                className="relative w-[90vw] h-[70vh] flex items-center justify-center"
              >
                <PlaceImage
                  src={images[currentIndex]}
                  alt={name}
                  className="max-w-full max-h-full object-contain shadow-2xl"
                  style={{ pointerEvents: zoom > 1 ? 'auto' : 'none' }}
                />
              </motion.div>

              {/* Modal Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prev() }}
                    className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl transition-all"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); next() }}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl transition-all"
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}
            </div>

            {/* Modal Bottom Thumbs */}
            <div className="absolute bottom-6 flex gap-2 max-w-[80vw] overflow-x-auto p-2 hide-scrollbar bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    currentIndex === i ? 'border-primary-500 scale-110' : 'border-transparent opacity-40 hover:opacity-100'
                  }`}
                >
                  <PlaceImage src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
