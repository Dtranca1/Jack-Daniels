// compatability file telling node/wrangler its an es module
import { httpServerHandler } from 'cloudflare:node';
import server from './server.js';

server.app.listen(server.PORT);
export default httpServerHandler({ port: server.PORT });