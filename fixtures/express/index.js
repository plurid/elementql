const express = require('express');
const elementqlExpress = require('@plurid/elementql-express');

const app = express();

app.use(
    elementqlExpress({
        verbose: true,
    }),
)

app.get('/', (req, res) => res.send('works'));


app.listen(3300, () => console.log('App listening on port 3300!'));
