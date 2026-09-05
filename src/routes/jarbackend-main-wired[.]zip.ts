import { createFileRoute } from "@tanstack/react-router";
import { backendZipResponse } from "@/lib/backend-zip";

export const Route = createFileRoute("/jarbackend-main-wired.zip")({
  server: { handlers: { GET: backendZipResponse } },
});
