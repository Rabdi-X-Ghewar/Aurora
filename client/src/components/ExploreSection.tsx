import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";
import Login from "./Login";
import FeatureCarousel from "./Carousel";
import Marquee from "./ui/marquee";

const ExploreSection = () => {
  const words = [
    {
      text: "Do",
      className: "text-black text-3xl font-montserrat", 
    },
    {
      text: "All",
      className: "text-black text-3xl font-montserrat",
    },
    {
      text: "DEFI",
      className: "text-black text-3xl font-montserrat",
    },
    {
      text: "Tooling",
      className: "text-black text-3xl font-montserrat",
    },
    {
      text: "with",
      className: "text-black text-3xl font-montserrat",
    },
    {
      text: "PLUTUS",
      className: "text-black text-4xl font-montserrat font-bold",
    },
  ];

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-black font-montserrat text-2xl font-light mb-4 border-b border-black pb-2 inline-block">
              WELCOME TO THE FUTURE
            </h2>

            <div className="mt-6">
              <TypewriterEffectSmooth words={words} />
            </div>

            <p className="mt-8 text-lg leading-relaxed font-montserrat border border-black p-6 rounded-2xl">
              Your One stop platform for all DEFI actions. Get AI
              recommendations on best APY, Stake with any asset, get rewarded in
              $EDU tokens, Use any onchain asset to do your onchain
              transactions.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-6">
              <button
                onClick={Login}
                className="px-8 py-4 bg-black text-white font-montserrat font-bold text-lg transition-transform hover:scale-105 rounded-full"
              >
                LOGIN TO DASHBOARD
              </button>
              <a
                href="#"
                className="px-8 py-4 border border-black text-black font-montserrat text-lg flex items-center justify-center sm:justify-start gap-2 transition-transform hover:scale-105 rounded-full"
              >
                LEARN MORE <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl  overflow-hidden">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/creative-SW6QDQbcVuwPgb6a2CYtYmRbsJa4k1.png"
                alt="Plutus Dashboard"
                className="w-full filter grayscale contrast-125 brightness-110 mix-blend-multiply"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white text-black py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-montserrat font-bold text-center mb-16">
            KEY FEATURES
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "SMART TRADING",
                description:
                  "Advanced trading tools with real-time analytics for optimal performance",
              },
              {
                title: "SECURE STORAGE",
                description:
                  "Military-grade encryption for your assets with multi-layer protection",
              },
              {
                title: "MULTI-CHAIN SUPPORT",
                description:
                  "Support for all major blockchain networks in one unified platform",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="border-2 border-black p-8 rounded-3xl"
              >
                <h3 className="text-2xl font-montserrat font-bold mb-4">
                  {feature.title}
                </h3>
                <div className="w-12 h-1 bg-black mb-6 rounded-full"></div>
                <p className="font-montserrat">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="relative mt-12">
          <FeatureCarousel />
        </div>
      </div>
      <Marquee />
      {/* CTA Section */}
      <div className="bg-white text-black py-24 border-t border-black">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-montserrat font-bold mb-8">
            READY TO GET STARTED?
          </h2>
          <p className="text-xl font-montserrat max-w-2xl mx-auto mb-12">
            Join thousands of users already transforming their financial future
            with Plutus.
          </p>
          <button
            onClick={Login}
            className="px-12 py-5 bg-black text-white font-montserrat font-bold text-lg transition-transform hover:scale-105 rounded-full"
          >
            START NOW
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExploreSection;