export default {
  async fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response("Subscription Platform Running 🚀");
    }

    if (url.pathname === "/sub") {
      return new Response(
        JSON.stringify({
          ok: true,
          message: "Subscription endpoint is alive"
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    return new Response("Not Found", { status: 404 });
  }
}
