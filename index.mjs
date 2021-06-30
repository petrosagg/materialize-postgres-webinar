import express from 'express'
import pg from 'pg'
import QStream from 'pg-query-stream'

const app = express();

app.use(express.static('public'))

app.get('/card_summary', async (req, res) => {
    const client = new pg.Client('postgres://materialize@localhost:6875/materialize');
    await client.connect();

    const query = new QStream('TAIL card_summary WITH (PROGRESS)', [], {batchSize: 1});
    const stream = client.query(query);

    res.setHeader('Content-Type', 'text/event-stream');

    for await (const event of stream) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
})

app.listen(4000)
