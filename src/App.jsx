import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/sections/Hero/Hero";
import Skills from "@/sections/Skills/Skills";
import Experience from "@/sections/Experience/Experience";
import Projects from "@/sections/Projects/Projects";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Skills />
        <Experience />
        <Projects />
      </main>
      <Footer />
    </div>
  );
}
