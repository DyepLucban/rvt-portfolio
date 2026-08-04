import Container from "@/components/layout/Container";
import SkillsSection from "@/sections/Skills/Skills";

export default function Skills() {
  return (
    <section className="relative min-h-screen overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-grid-dots opacity-30" aria-hidden="true" />
      <Container>
        <SkillsSection />
      </Container>
    </section>
  );
}
