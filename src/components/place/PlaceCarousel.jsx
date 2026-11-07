'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react'
import { PlaceImage } from '@/components/common/PlaceImage'

export function PlaceCarousel({ images, name }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const imageCount = images?.length || 0

  useEffect(() => {
    if (!isFullscreen || !imageCount) return
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') setCurrentIndex((index) => (index + 1) % imageCount)
      if (event.key === 'ArrowLeft') setCurrentIndex((index) => (index - 1 + imageCount) % imageCount)
      if (event.key === 'Escape') { setIsFullscreen(false); setZoom(1) }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen, imageCount])

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

  return (
    <div className="relative group">
      {/* Grid Display */}
      <div className={`grid gap-1.5 sm:gap-2 h-[350px] sm:h-[450px] rounded-2xl overflow-hidden border border-neutral-200 dark:border-dark-700 shadow-sm ${
        images.length >= 3 ? 'grid-cols-2 sm:grid-cols-3 grid-rows-2' :
        images.length === 2 ? 'grid-cols-2 grid-rows-1' :
        'grid-cols-1 grid-rows-1'
      }`}>
        {/* Large Image */}
        <div
          className={`relative ${images.length >= 3 ? 'col-span-2 sm:col-span-2 row-span-1 sm:row-span-2' : 'col-span-1 row-span-1'} h-full cursor-pointer group/img overflow-hidden`}
          onClick={() => { setCurrentIndex(0); setIsFullscreen(true); }}
        >
          <PlaceImage src={images[0]} alt={`${name} - 1`} fill className="object-cover group-hover/img:scale-105 transition-transform duration-700" priority sizes="(max-width: 1200px) 100vw, 800px" />
          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors pointer-events-none" />
          {images.length === 1 && (
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-neutral-900 px-3 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 size={16} /> View Fullscreen
            </div>
          )}
        </div>

        {/* Small Image 1 */}
        {images.length >= 2 && (
          <div
            className="relative col-span-1 row-span-1 h-full cursor-pointer group/img overflow-hidden"
            onClick={() => { setCurrentIndex(1); setIsFullscreen(true); }}
          >
            <PlaceImage src={images[1]} alt={`${name} - 2`} fill className="object-cover group-hover/img:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 50vw, 33vw" />
            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors pointer-events-none" />
            {images.length === 2 && (
               <div className="absolute inset-0 bg-black/20 group-hover/img:bg-black/30 transition-colors flex items-center justify-center">
                 <span className="bg-white/90 backdrop-blur-sm text-neutral-900 px-4 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2">
                   <Maximize2 size={16} /> View Gallery
                 </span>
               </div>
            )}
          </div>
        )}

        {/* Small Image 2 */}
        {images.length >= 3 && (
          <div
            className="relative col-span-1 row-span-1 h-full cursor-pointer group/img overflow-hidden"
            onClick={() => { setCurrentIndex(2); setIsFullscreen(true); }}
          >
            <PlaceImage src={images[2]} alt={`${name} - 3`} fill className="object-cover group-hover/img:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 50vw, 33vw" />
            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors pointer-events-none" />

            {images.length > 3 && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center transition-colors group-hover/img:bg-black/60">
                <span className="text-white font-serif font-bold text-3xl">+{images.length - 3}</span>
                <span className="text-white/90 text-xs font-bold uppercase tracking-widest mt-1">More Photos</span>
              </div>
            )}
          </div>
        )}
      </div>

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
                <div className="flex items-center bg-white/10 rounded-xl p-1 backdrop-blur-md hidden sm:flex">
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
                className="relative w-[100vw] sm:w-[90vw] h-[70vh] flex items-center justify-center"
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
                    className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl transition-all"
                  >
                    <ChevronLeft size={24} className="sm:w-8 sm:h-8" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); next() }}
                    className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl transition-all"
                  >
                    <ChevronRight size={24} className="sm:w-8 sm:h-8" />
                  </button>
                </>
              )}
            </div>

            {/* Modal Bottom Thumbs */}
            <div className="absolute bottom-6 flex gap-2 max-w-[90vw] sm:max-w-[80vw] overflow-x-auto p-2 hide-scrollbar bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`relative w-14 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
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
