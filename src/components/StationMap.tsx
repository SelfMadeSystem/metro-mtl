import clsx from "clsx";
import { motion } from "framer-motion";
import { useState } from "react";

export default function StationMap({
  map,
  title,
  description,
  alt,
}: {
  map: string;
  title: React.ReactNode;
  description: React.ReactNode;
  alt: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  return (
    <section className="bg-white/50 rounded-xl shadow-lg overflow-hidden dark:bg-stm-black/50 dark:border dark:border-white/10">
      <div
        className="px-6 py-4 bg-gray-50 cursor-pointer dark:bg-stm-black/70"
        onClick={() => {
          setIsOpen(!isOpen);
          setHasLoaded(true);
        }}
      >
        <h2 className="text-xl font-semibold text-gray-900 flex items-center dark:text-white">
          {title}
        </h2>
        <p className="text-gray-600 mt-1 dark:text-gray-200">{description}</p>
      </div>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={clsx("overflow-hidden", !isOpen && "pointer-events-none")}
      >
        <div className="flex justify-center p-6 border-t">
          {hasLoaded && (
            <img
              src={map}
              alt={alt}
              className="max-w-full h-auto rounded-lg shadow-sm bg-white"
              width={600}
            />
          )}
        </div>
      </motion.div>
    </section>
  );
}
