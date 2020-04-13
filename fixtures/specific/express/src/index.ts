import express from 'express';

import elementqlExpress from '@plurid/elementql-express';



const app = express();

app.use(
    elementqlExpress({
        verbose: true,
    }),
)

app.get('/', (req: any, res: any) => res.send('works'));


app.listen(3300, () => console.log('App listening on port 3300!'));
