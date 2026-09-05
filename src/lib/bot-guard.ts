// Bot blocking temporarily disabled — allow all crawlers.
export function isBotRequest(_request: Request): boolean {
  return false;
}

export function botBlockedResponse(): Response {
  return new Response("Forbidden", { status: 403 });
}
