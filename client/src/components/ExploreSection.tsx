"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";
import Login from "./Login";
import FeatureCarousel from "./Carousel";
import Marquee from "./ui/marquee";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ShieldCheck,
  Layers,
  BellIcon,
  CalendarIcon,
} from "lucide-react";

const ExploreSection = () => {
  const words = [
    {
      text: "Your",
      className: "text-black text-3xl font-montserrat",
    },
    {
      text: "AGENT",
      className: "text-black text-3xl font-montserrat",
    },
    {
      text: "COMPANION",
      className: "text-black text-3xl font-montserrat",
    },
    {
      text: "ON",
      className: "text-black text-3xl font-montserrat",
    },
    {
      text: "Aptos",
      className: "text-black text-3xl font-montserrat",
    },
  ];

  // Features data for BentoGrid
  const features = [
    {
      Icon: Sparkles,
      name: "SMART TRADING",
      description:
        "Advanced trading tools with real-time analytics for optimal performance.",
      href: "#",
      cta: "Learn More",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 opacity-20" />
      ),
      className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
    },
    {
      Icon: ShieldCheck,
      name: "SECURE STORAGE",
      description:
        "Military-grade encryption for your assets with multi-layer protection.",
      href: "#",
      cta: "Learn More",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-500 opacity-20" />
      ),
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
    },
    {
      Icon: Layers,
      name: "MULTI-CHAIN SUPPORT",
      description:
        "Support for all major blockchain networks in one unified platform.",
      href: "#",
      cta: "Learn More",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-500 opacity-20" />
      ),
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    },
    {
      Icon: CalendarIcon,
      name: "SCHEDULED PAYMENTS",
      description:
        "Automate utility payments and recurring transactions with ease on Aptos.",
      href: "#",
      cta: "Learn More",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-red-500 opacity-20" />
      ),
      className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
    },
    {
      Icon: BellIcon,
      name: "REAL-TIME NOTIFICATIONS",
      description:
        "Stay informed with instant alerts for trades, payments, and updates on Echelon Market and Joule Finance",
      href: "#",
      cta: "Learn More",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-500 opacity-20" />
      ),
      className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
    },
  ];

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Hero Section */}
      <section className="relative z-0 flex min-h-[80vh] w-full flex-col items-center justify-center overflow-hidden rounded-md bg-background">
        {/* Gradient Background */}
        <div className="absolute top-0 isolate z-0 flex w-screen flex-1 items-start justify-center">
          {/* Main Glow */}
          <div className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-[-30%] rounded-full bg-primary/60 opacity-80 blur-3xl" />

          {/* Lamp Effect */}
          <motion.div
            initial={{ width: "8rem" }}
            viewport={{ once: true }}
            transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
            whileInView={{ width: "16rem" }}
            className="absolute top-0 z-30 h-36 -translate-y-[20%] rounded-full bg-primary/60 blur-2xl"
          />

          {/* Top Line */}
          <motion.div
            initial={{ width: "15rem" }}
            viewport={{ once: true }}
            transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
            whileInView={{ width: "30rem" }}
            className="absolute inset-auto z-50 h-0.5 -translate-y-[-10%] bg-primary/60"
          />

          {/* Left Gradient Cone */}
          <motion.div
            initial={{ opacity: 0.5, width: "15rem" }}
            whileInView={{ opacity: 1, width: "30rem" }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            style={{
              backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
            }}
            className="absolute inset-auto right-1/2 h-56 overflow-visible w-[30rem] bg-gradient-conic from-primary/60 via-transparent to-transparent [--conic-position:from_70deg_at_center_top]"
          >
            <div className="absolute w-[100%] left-0 bg-background h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
            <div className="absolute w-40 h-[100%] left-0 bg-background bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
          </motion.div>

          {/* Right Gradient Cone */}
          <motion.div
            initial={{ opacity: 0.5, width: "15rem" }}
            whileInView={{ opacity: 1, width: "30rem" }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            style={{
              backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
            }}
            className="absolute inset-auto left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-primary/60 [--conic-position:from_290deg_at_center_top]"
          >
            <div className="absolute w-40 h-[100%] right-0 bg-background bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
            <div className="absolute w-[100%] right-0 bg-background h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          </motion.div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ y: 100, opacity: 0.5 }}
          viewport={{ once: true }}
          transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
          whileInView={{ y: 0, opacity: 1 }}
          className="relative z-50 container flex justify-center flex-1 flex-col px-5 md:px-10 gap-4 -translate-y-20 text-center"
        >
          <h2 className="text-2xl font-light border-b border-black pb-2 inline-block">
            WELCOME TO THE FUTURE
          </h2>

          <div className="mt-6">
            <TypewriterEffectSmooth words={words} />
          </div>

          <p className="mt-8 text-lg leading-relaxed max-w-2xl mx-auto border border-black p-6 rounded-2xl">
            Aurora: Your All-in-One Personal Agent on Aptos. Seamlessly manage wallets,
            trade with Echelon and Joule Finance, and make utility payments—all in one intuitive interface.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={Login}
              className="px-8 py-4 bg-black text-white font-bold text-lg transition-transform hover:scale-105 rounded-full"
            >
              LOGIN TO DASHBOARD
            </button>
            <a
              href="#"
              className="px-8 py-4 border border-black text-black flex items-center justify-center gap-2 transition-transform hover:scale-105 rounded-full"
            >
              LEARN MORE <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features Section - Updated with BentoGrid */}
      <div className="bg-white text-black py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">KEY FEATURES</h2>

          <BentoGrid className="lg:grid-rows-3">
            {features.map((feature) => (
              <BentoCard key={feature.name} {...feature} />
            ))}
          </BentoGrid>
        </div>
        <div className="relative mt-12">
          <FeatureCarousel />
        </div>
      </div>
      <Marquee />

      {/* CTA Section */}
      <div className="bg-white text-black py-24 border-t border-black">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8">READY TO GET STARTED?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-12">
            Join thousands of users already transforming their financial future
            with Aurora.
          </p>
          <Button
            size="lg"
            onClick={Login}
            className="px-12 py-5 bg-black text-white font-bold text-lg transition-transform hover:scale-105 rounded-full"
          >
            START NOW
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExploreSection;