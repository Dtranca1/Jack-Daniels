export default {
    async fetch(request, env) {

        // gets info about the current URL being visited
        const url = new URL(request.url);

        // makes dashboard.html the root page
        if (url.pathname === "/") {
            return env.ASSETS.fetch(
                new Request(
                    new URL("/dashboard.html", request.url),
                    request
                )
            );
        }

        // tests the connection to the D1 database
        if (url.pathname === "/api/test") {
            const result = await env.DB
                .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
                .all();

            return Response.json(result);
        }

        // serves all other files from the public folder
        return env.ASSETS.fetch(request);
    }
};