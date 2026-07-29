import { SearchX } from "lucide-react";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center py-24">
      <Container>
        <div className="text-center">
          <SearchX
            className="mx-auto h-12 w-12 text-accent"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="mt-6 font-mono text-sm text-accent">404</p>
          <h1 className="mt-4 font-display text-5xl font-bold text-text">
            Page not found
            <span className="text-accent animate-cursor" aria-hidden="true">
              |
            </span>
          </h1>
          <p className="mt-4 text-text-muted">
            Sorry, the page you're looking for doesn't exist.
          </p>
          <Button to="/" className="mt-8">
            Back home
          </Button>
        </div>
      </Container>
    </section>
  );
}
