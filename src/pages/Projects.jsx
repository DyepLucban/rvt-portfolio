import Container from "@/components/layout/Container";
import ProjectsSection from "@/sections/Projects/Projects";

export default function Projects() {
  return (
    <section className="relative min-h-screen overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-grid-dots opacity-30" aria-hidden="true" />
      <Container>
        <ProjectsSection />
      </Container>
    </section>
  );
}
