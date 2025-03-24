import { motion } from "framer-motion";

export default function Marquee() {
  // Add your logo imports or paths
  const logos = [
    "m1.jpg",
    "m2.jpg",
    "m3.jpg",
    "m4.jpg",
  ];

  return (
    <div className="relative w-full overflow-hidden bg-background py-16">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10" />
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
          duration: 15,
        }}
      >
        {[...Array(4)].map((_, outerIndex) => (
          <div key={outerIndex} className="flex items-center mx-8">
            {logos.map((logo, index) => (
              <div
                key={`${outerIndex}-${index}`}
                className="mx-8 rounded-full border-2 border-gray-400 p-4 bg-white/5 backdrop-blur-sm hover:border-black transition-colors duration-300"
                style={{
                  width: "120px",
                  height: "120px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={logo}
                  alt={`Logo ${index + 1}`}
                  className="w-30 h-30 object-contain rounded-full"
                />
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
