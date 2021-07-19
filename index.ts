import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
import connectDb from './db';
import stories from './stories';

const app = express();
const port = 3000;

app.use(morgan("short"));
app.use(express.json());

app.get("/", function (req, res) {
    res.status(203).json({ message: "serwas" });
});

app.post('/stories', function(req, res) {
    stories.createStory(req.body);
    res.status(201).send();
})

app.get('/stories', async function(req, res) {
    const allStories = await stories.getStories();
    res.json(allStories);
})

connectDb().then(() => {
    app.listen(port, function () {
        console.log(`Server is running on http://localhost:${port}`);
    });
});
