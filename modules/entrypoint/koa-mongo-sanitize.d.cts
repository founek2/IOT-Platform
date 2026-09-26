declare module 'koa-mongo-sanitize' {
    const sanitize: () => import('koa').Middleware;
    export default sanitize;
}
