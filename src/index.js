export default {
    async fetch(request, env) {

        // gets info about the current URL being visited
        const url = new URL(request.url);

        // sends the root domain to the dashboard
        if (url.pathname === "/") {
            return Response.redirect(
                new URL("/dashboard", request.url).toString(),
                302
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