'use client'

import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export const Card = React.forwardRef(
  ({ children, className, interactive = false, ...motionProps }, ref) => (
    <motion.div
      ref={ref}
      className={clsx(
        'rounded-2xl border border-neutral-200 dark:border-dark-700 bg-white dark:bg-dark-800 p-6',
        interactive && 'hover:shadow-premium-lg transition-shadow',
        className
      )}
      whileHover={interactive ? { y: -4 } : {}}
      {...motionProps}
    >
      {children}
    </motion.div>
  )
)

Card.displayName = 'Card'
