import { SearchX } from "lucide-react";
import { useLocation } from "react-router-dom";
import Container from "@/components/layout/Container";
import { Button, Card, DataRow, Frame, PanelHeader } from "@/components/ui";

export default function NotFound() {
  const location = useLocation();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden py-24">
      <div className="absolute inset-0 -z-10 bg-grid-dots opacity-30" aria-hidden="true" />
      <Container className="max-w-lg">
        <Frame className="overflow-hidden rounded-sm">
          <Card as="div" padding="none" className="overflow-hidden bg-surface/80">
            <PanelHeader label="ERR_404.LOG" />
            <div className="p-8 text-center sm:p-10">
              <SearchX
                className="mx-auto h-12 w-12 text-accent"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <h1 className="mt-6 font-display text-5xl font-bold text-text">
                Page not found
                <span className="text-accent animate-cursor" aria-hidden="true">
                  |
                </span>
              </h1>
              <p className="mt-4 font-mono text-sm text-text-muted">
                Sorry, the page you're looking for doesn't exist.
              </p>

              <DataRow
                className="mt-6 text-left"
                rows={[
                  { label: "Status", value: "404" },
                  { label: "Route", value: location.pathname },
                ]}
              />

              <Button to="/" className="mt-8">
                Back home
              </Button>
            </div>
          </Card>
        </Frame>
      </Container>
    </section>
  );
}
