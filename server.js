const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const { streamEvents } = require('http-event-stream');
const uuid = require('uuid');
const Router = require('koa-router');
const app = new Koa();
const cors = require('@koa/cors');

const router = new Router();

app.use(cors());

app.use(koaBody({
    urlencoded: true,
    multipart: true,
    text: true,
    json: true,
}));

router.get('/sse', async (ctx) => {

    streamEvents (ctx.req, ctx.res, {
        async fetch(lastEventId) {
            console.log(lastEventId);
            return [];
        },
        stream(sse) {
            const interval = setInterval(() => {
            let d = Math.random();
            if (d < 0.5) {
                // 50% chance of being here
                sse.sendEvent({
                    "data": JSON.stringify('Идёт перемещение мяча по полю, игроки и той, и другой команды активно пытаются атаковать'),
                    "id": uuid.v4(),
                    "event": 'action'
                });
            } else if (d < 0.9) {
                // 40% chance of being here
                sse.sendEvent({
                    "data": JSON.stringify('Нарушение правил, будет штрафной удар'),
                    "id": uuid.v4(),
                    "event": 'freekick'
                });
            } else {
                // 10% chance of being here
                sse.sendEvent({
                    "data": JSON.stringify('Отличный удар! И Г-О-Л!'),
                    "id": uuid.v4(),
                    "event": 'goal'
                });
            }

        }, 3000);

            const timerStop = setTimeout(() => {
                clearInterval(interval)
            }, 150000);


            return timerStop;
        }
    });

    ctx.respond = false; // koa не будет обрабатывать ответ
});

router.get('/index', async (ctx) => {
    ctx.response.body = 'hello';
});

app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 7070;
http.createServer(app.callback()).listen(port);
