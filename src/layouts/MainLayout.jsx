import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { pageTransition } from "@/lib/motionVariants";

export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Tints the page background image so it stays a faint backdrop rather
          than competing with content. */}
      <div className="fixed inset-0 -z-10 bg-bg/50" aria-hidden="true" />
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} {...pageTransition}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
