export default {
  async fetch(request: Request): Promise<Response> {
    return new Response("Subscription Platform is running 🚀", {
      headers: { "Content-Type": "text/plain" }
    });
  }
};
