"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaPlay, FaCheckCircle, FaRocket } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import ChatWidget from "./ChatWidget";

const HeroSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const phGradient =
    "bg-gradient-to-r from-[#832388] via-[#E3436B] to-[#F0772F]";
  const phTextGradient =
    "text-transparent bg-clip-text bg-gradient-to-r from-[#832388] via-[#E3436B] to-[#F0772F]";

  return (
    <div className="relative w-full overflow-hidden bg-[#fcfaff] transition-colors dark:bg-slate-950">
      <div className="container mx-auto px-4 pt-8 pb-16 sm:px-6 md:pt-12 md:pb-24 lg:px-16">
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="order-2 w-full space-y-6 text-center md:space-y-8 lg:order-1 lg:w-1/2 lg:pt-4 lg:text-left"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100 px-3 py-1.5 dark:border-purple-800 dark:bg-purple-900/30 md:px-4 md:py-2">
              <HiSparkles className="animate-pulse text-sm text-[#E3436B] md:text-base" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#832388] dark:text-purple-300 md:text-xs">
                AI-Powered Smart Learning
              </span>
            </div>

            <h1 className="text-2xl font-black leading-[1.2] text-[#1e1e2f] dark:text-white sm:text-3xl md:text-4xl lg:text-6xl lg:leading-[1.1]">
              শেখার ধরন হোক <br className="hidden sm:block" />
              <span className={phTextGradient}>স্মার্ট ও পারসোনালাইজড</span>
            </h1>

            <p className="mx-auto max-w-xl px-2 text-base font-medium leading-relaxed text-gray-600 dark:text-gray-400 sm:px-0 md:text-sm lg:mx-0 lg:text-sm">
              আমাদের AI আপনার শেখার গতি বুঝবে এবং আপনাকে দিবে সঠিক গাইডলাইন।
              অটোমেটেড গ্রেডিং ও স্মার্ট সামারিতে পড়াশোনা হবে আরও সহজ।
            </p>

            <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row md:gap-5 lg:justify-start">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-black text-white shadow-xl transition-all sm:w-auto md:rounded-2xl md:px-10 md:py-4 md:text-base ${phGradient}`}
              >
                <FaRocket /> শুরু করো ফ্রিতে
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-8 py-3.5 text-sm font-black text-gray-700 transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:text-white sm:w-auto md:rounded-2xl md:px-10 md:py-4 md:text-base"
              >
                <FaPlay className="text-[10px] text-[#E3436B]" /> ওরিয়েন্টেশন
                ভিডিও
              </motion.button>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-4 md:gap-8 lg:justify-start">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 md:text-base">
                <FaCheckCircle className="text-[#F0772F]" /> AI ভিত্তিক মূল্যায়ন
              </span>
              <span className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 md:text-base">
                <FaCheckCircle className="text-[#F0772F]" /> স্মার্ট ড্যাশবোর্ড
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="group order-1 relative w-full lg:order-2 lg:w-1/2"
          >
            <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E3436B]/20 blur-[60px] md:h-80 md:w-80 md:blur-[100px]" />

            <div className="relative aspect-video overflow-hidden rounded-2xl border-[6px] border-white bg-black shadow-[0_10px_40px_rgba(131,35,136,0.15)] dark:border-slate-800 md:rounded-[32px] md:border-[10px]">
              {!isPlaying ? (
                <div
                  className="absolute inset-0 z-30 flex cursor-pointer items-center justify-center"
                  onClick={() => setIsPlaying(true)}
                >
                  <img
                    src="https://img.youtube.com/vi/z58Sh8IndkY/maxresdefault.jpg"
                    alt="Video Thumbnail"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-all duration-500 group-hover:bg-black/40">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`flex h-14 w-14 items-center justify-center rounded-full shadow-2xl md:h-20 md:w-20 lg:h-24 lg:w-24 ${phGradient}`}
                    >
                      <FaPlay className="ml-1 text-xl text-white md:ml-2 md:text-3xl" />
                    </motion.div>
                  </div>
                </div>
              ) : (
                <iframe
                  className="relative z-10 h-full w-full"
                  src="https://www.youtube.com/embed/z58Sh8IndkY?autoplay=1"
                  title="AI Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-2 z-50 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900 md:-bottom-6 md:-left-6 md:p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-xl dark:bg-orange-900/30 md:h-12 md:w-12 md:text-2xl">
                🎓
              </div>
              <div>
                <h4 className="text-sm leading-tight font-black text-slate-800 dark:text-white md:text-base">
                  ১০+ কোর্স
                </h4>
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 md:text-xs">
                  সবই AI গাইডেড
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Chat Widget Component */}
      <ChatWidget />
    </div>
  );
};

export default HeroSection;