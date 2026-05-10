"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { MapPin, PenLine, Shield } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    title: "Discover",
    description:
      "Browse our curated directory of hidden temples, scenic trails, and cultural landmarks.",
    color: "text-primary-400",
    bg: "bg-primary-500/10",
  },
  {
    icon: PenLine,
    title: "Contribute",
    description:
      "Add new places, write honest reviews, and share your first-hand experiences.",
    color: "text-secondary-400",
    bg: "bg-secondary-500/10",
  },
  {
    icon: Shield,
    title: "Verified",
    description:
      "Our community moderates all content to ensure quality, accuracy, and authenticity.",
    color: "text-accent-400",
    bg: "bg-accent-500/10",
  },
];

export function CallToAction() {
  return (
    <>
      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-dark-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold tracking-widest uppercase text-primary-500 mb-4">
              Simple Process
            </p>
            <h2 className="text-4xl font-serif font-bold text-neutral-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
              Join thousands of local explorers building the most comprehensive
              guide to Villupuram.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                className="relative bg-white dark:bg-dark-800 rounded-2xl p-8 border border-neutral-200 dark:border-dark-700 shadow-sm hover:shadow-md transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                {/* Step number */}
                <div className="absolute -top-4 left-8 w-8 h-8 bg-white dark:bg-dark-900 border border-neutral-200 dark:border-dark-700 rounded-full flex items-center justify-center text-xs font-bold text-neutral-500 dark:text-neutral-400 shadow-sm">
                  {i + 1}
                </div>
                <div
                  className={`w-14 h-14 ${step.bg} ${step.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <step.icon size={26} />
                </div>
                <h3 className="text-xl font-serif font-bold text-neutral-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-primary-800 dark:bg-primary-900">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
        </div>

        <motion.div
          className="relative max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-primary-300 text-sm font-semibold tracking-widest uppercase mb-4">
            Be Part of the Story
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
            Ready to Explore Villupuram?
          </h2>
          <p className="text-primary-100/80 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Join our growing community of local experts and travelers. Share
            your discoveries, write reviews, and help others find the real
            Villupuram.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link href="/explore">
              <Button
                size="md"
                className="border-primary/30 text-dark-900 hover:bg-primary-50 font-semibold px-4 py-3 rounded-full shadow-xl"
              >
                Start Exploring
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                variant="outline"
                size="md"
                className="border-white/30 text-white hover:bg-white/10 px-4 py-3 rounded-full shadow-xl"
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  );
}
