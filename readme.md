# expressjs quickstart

# requirements

-   basic knowledge of javascript and web development

# installs

-   [https://nodejs.org/en/](https://nodejs.org/en/) (LTS)
-   [https://code.visualstudio.com/](https://code.visualstudio.com/) (or IDE of your choice)
    -   thunder client
    -   prettier

# preface

**nodejs history**

javascript usually previously only ran in the browser. until google built the V8 engine for its browser. nodejs combined engine with an event loop and a low level api to run javascript on machines / servers directly.

**package manager**

node comes with `npm` (node package manager), that allows installing and sharing packages. → one of the most essential things about javascript.

**ESM vs CommonJS Module Syntax**

javascript didnt have modules for a long time. one of the first variants was CommonJS ⇒ used in node.js by default. with the advent of javascript libraries, ESM was standardized and is available in node under a flag. `type: module` in package.json. if you're using typescript, the ESM syntax is automatically compiled for you, so you dont need to setup any flags.

while the modern approach is ESM, you'll mostly find nodejs documentation that uses the commonjs syntax

```jsx
const defaultExport = 0;
const namedExport = 1;

// ESM Export
export namedExport;
export default defaultExport;
// ESM Import
import defaultExport, {namedExport} from 'module-name';

// CJS Export
module.exports = defaultExport;
exports.namedExport = namedExport;
// CJS Import
const module = require('module-name');
// module.namedExport -> 1
```

# our first API

```bash
# create a folder
mkdir express-demo
cd express-demo
# initialize npm project
npm init -y

# open folder in vscode
code .
```

this gives us a `package.json` file where our project info + dependencies are stored.

**install dependencies**

Now we can install the dependencies we'll need to get going. We only use express at first, but will touch the others later.

```bash
npm install express morgan nodemon
# express: web framework
# morgan: http logger
# nodemon: automaticall restart application on code-change
```

**create our server**

```jsx
// index.js
const express = require("express");

// initialize express
const app = express();
const port = 3000;

// define routes
app.get("/", function (req, res) {
    res.send("hello");
});

// start server
app.listen(port, function () {
    console.log(`Server is running at http://localhost:${port}`);
});
```

**add middleware for logging**

```jsx
// index.js
const express = require("express");
const morgan = require("morgan");

const app = express();
const port = 3000;

// attach a middleware to any endpoints defined after here
app.use(morgan("short"));

app.get("/", function (req, res) {
    res.send("hello");
});

app.listen(port, function () {
    console.log(`Server is running at http://localhost:${port}`);
});
```

**add middleware for json handling**

we only care about json data for our api, so lets use a middleware that only does that

```tsx
const express = require("express");
const morgan = require("morgan");

const app = express();
const port = 3000;

app.use(morgan("short"));
// now all request body checks
app.use(express.json());

app.get("/", function (req, res) {
    res.send("hello");
});

app.listen(port, function () {
    console.log(`Server is running at http://localhost:${port}`);
});
```

**start our server**

```bash
# starts a node process, running our index.js file
node .
```

we should now receive `hello` when making a request to `localhost:3000/stories`

and when sending a `POST` request to the same url, we should get our request body sent back to us.

if we change `hello` to `hi` and refresh the page, it doesnt update though. This is because the original process is running, and its not restarting automatically.

**autorefresh server with nodemon**

```bash
// package.json
"scripts": {
  "start": "nodemon index.js"
},
```

We can now run `npm start` to start the server and try again ⇒ voila.

Anytime we change index.js, it will restart the server for us.

![readme/Untitled.png](readme/Untitled.png)

-   start is a reserved name. usually you have to type `npm run [scriptName]`

# mongoDB

since we're microsoft people, we go to [portal.azure.com](http://portal.azure.com) > AzureCosmosDb and create a new one. Make sure we use the MongoDB engine. Will take a bit.

Alternatively, you can do the same with [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free)

![readme/screenshot%201.png](readme/screenshot%201.png)

Once created, click it, go to Quick start > Node.js to get the connection string.

**create db.js file**

lets create our new module that will handle all database logic `db.js`

**install dependencies**

`npm i mongoose`

**create our database connection**

we also export our connectDb function from our module

```jsx
// db.js
const mongoose = require("mongoose");

function connectDb() {
    return mongoose
        .connect(
            "mongodb+srv://m001-student:m001-mongodb-basics@sandbox.cjoiq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
        )
        .then((connection) => {
            console.log("Connected to DB");
        });
}

module.exports = connectDb;
```

Now we can use this module in our main script, by loading it.

```jsx
// index.js
const connectDb = require("./db");

// ...
connectDb().then(() => {
    app.listen(port, function () {
        console.log(`Server is running at http://localhost:${port}`);
    });
});
```

**move secret into .env file**

saving secrets in the code is dangerous, so lets quickly remove the secret from our code by using environment variables

`npm i dotenv`

create a `.env` file in the root, this file will only exist on your local machine, or the server and not be saved to a git repository. so its contents will be secret.

require, and config `dotenv` in `index.js`

```tsx
// index.js
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const connectDb = require("./db");

// ... rest of the file
```

now we can just use the variable `process.env.CONNECTION_STRING`

```tsx
// db.js
const mongoose = require("mongoose");

function connectDb() {
    return mongoose.connect(process.env.CONNECTION_STRING).then((connection) => {
        console.log("Connected to DB");
    });
}

module.exports = connectDb;
```

We should now see a "Connected to DB" message.

## our first db model

mongodb is based on documents, and a document is an instance of a model.

create a new file where we keep all our logic for interacting with the stories entity

```jsx
// stories.js
const mongoose = require("mongoose");

// define our model with a name and a schema
const StorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    effort: {
        type: Number,
        default: null,
    },
    done: {
        type: Boolean,
        default: false,
    },
});
const Story = mongoose.model("Story", StorySchema);

// we create our own functions to abstract interaction with the db
async function createStory(payload) {
    const story = new Story(payload);
    return story.save();
}

async function getStories() {
    return await Story.find();
}

// here we export the public members of our module via named exports
exports.createStory = createStory;
exports.getStories = getStories;
```

you'll notice that we use `async` here for the functions. this is because the db actions are asynchronous, and we want to `await` them, to move on.

next we can update our api handlers

```jsx
// index.js
app.get("/stories", async (req, res) => {
    const documents = await stories.getStories();
    res.json(documents);
});

app.post("/stories", async (req, res) => {
    const story = req.body;
    const document = await stories.createStory(story);
    res.json(document);
});
```

we're using `async` in our handlers as well, since we want to await loading all stories from the db.

try creating a new story via `POST [http://localhost:3000](http://localhost:3000)` and supplying details in the request body. then call `GET http://localhost:3000` and you'll see all our created stories.

-   keep in mind that there is no schema validation yet. since document based databases, dont have to follow a schema 100%, we can just omit any field and add new ones. they will still create just fine.

```jsx
POST localhost:3000/stories
{
    "title": "my story",
    "effort": 3
}

// Response
{
  "_id": "609296699e58bb71d0bf18a0",
  "title": "my story",
  "effort": 3,
  "done": false,
  "__v": 0
}
```

# migrating to ESM

because CommonJS is oldschool, lets refactor to use ESM syntax.

in `package.json` add this line

```jsx
// package.json
"type": "module",
```

now node will expect us to use modules. but by default node is looking for `.jsm` files, we could either rename all our files or update the imports to include the file extension: `import x from './myjsfile.js`

Your `index.js` file should now look like this

```jsx
import express from "express";
import morgan from "morgan";
import { db } from "./db.js";
// we changed below, to support named imports
// could also be namespaced, like below
// import * as stories from "./stories.js";
import { getStories, createStory } from "./stories.js";

const app = express();
const port = 3000;

// attach a middleware to any endpoints defined after here
app.use(morgan("short"));
app.use(express.json());

// endpoint + handler
app.get("/stories", async (req, res) => {
    const documents = await getStories();
    res.json(documents);
});

app.post("/stories", async (req, res) => {
    const story = req.body;
    const document = await createStory(story);
    res.json(document);
});

app.listen(port, () => {
    db();
    console.log(`Server is running at http://localhost:${port}`);
});
```

# Typescript to the rescue

while javascript gets you up and running fast, not having types is brittle and requires crazy discipline and documentation. typescript is a superset of javascript that lets us use typescript features **on top** of our javascript.

all javascript is valid typescript, but not the other way around. so in order for node and browsers to understand our code, we need to compile it first.

**install the compiler and runtime, and initialize the typescript project**

```bash
npm i typescript ts-node
# npx allows us to execute node binaries directly, as if they were installed globally (comes with npm)
npx tsc --init
```

we now got a `tscconfig.json` file that has all the info for our typescript compiler.

`typescript` is our runtime, while `ts-node` allows us to run typescript code without compilation (for dev purposes)

**migrating our files to typescript**

lets make our `index.js` file a typescript file, by just renaming it to `index.ts` and update `package.json`

```json
// package.json
// "type": "module", <-- we need to remove this again, as we now no longer use native ESM
"scripts": {
  "start": "nodemon -x ts-node index.ts"
},
```

We can also remove the `.js` extensions on the imports, since we're no longer using native ESM.

**typescript yelling**

You most likely already saw it in the `index.ts` file, but if we run our app again with `npm start` it will crash.

![readme/screenshot%202.png](readme/screenshot%202.png)

This is typescript yelling at us because of broken, or missing types or general errors. This is pretty handy, because previously we'd have to run the app and find errors at runtime.

**type packages**

lots of older packages arent yet rewritten in typescript, thus they do not have any type definitions that tell our typescript code how to handle it. there is a massive community monorepo called definitely typed: [https://github.com/DefinitelyTyped/DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)

for any mid-size library that isn't written in typescript, you'll find community generated type definitions on there that you can just install via `npm i @types/package-name`

so lets install types for our stuff

```json
npm i @types/express @types/morgan @types/mongoose
```

the external packages are now fine, but our internal stuff has the same problem.

![readme/screenshot%203.png](readme/screenshot%203.png)

While we could disable the `no implicit any` error, since its not game-breaking, its better to help typescript understand our code. Thats super easy, because we just have to make our files typescript files as well.

**our code was buggy all along?**

if we check our `db.js` file, we'll see that something is wrong

![readme/screenshot%204.png](readme/screenshot%204.png)

typescript now tells us that `process.env.CONNECTION_STRING` could potentially be undefined. and `mongoose.connect` requires a string as the first input, so lets default to a string if the env variable is not set.

```jsx
// db.ts
import mongoose from "mongoose";

const connectionString = process.env.CONNECTION_STRING || "";

export const db = function () {
    mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true }).then((connection) => {
        console.log(`Connected to DB`);
    });
};
```

our `stories.ts` also has some issues, lets check out what is wrong.

**missing schemas**

![readme/screenshot%205.png](readme/screenshot%205.png)

What typescript tells us here is that we pass an object literal, but `Schema<someGenerics>` is expected.

if we check the mongoose [documentation](https://mongoosejs.com/docs/guide.html#definition), we'll see that mongoose actually requires Schemas, for the creation of the model. This is because schemas have some extra stuff built in, which we wouldnt have with just a plain object literal.

```jsx
// stories.ts
// ...

// define our model with a name and a schema
const storySchema = new mongoose.Schema({ title: String, effort: Number, done: Boolean });
const Story = mongoose.model("Story", storySchema);

//...
```

But why wasnt this the same as before? Well if we ctrl+click `Schema` vscode will take us to the type definitions, where we can see all the magic the Schema class provides.

![readme/screenshot%206.png](readme/screenshot%206.png)

**implicit vs explicit types**

the other issue we have is that our payload has an implicit `any` type.

![readme/screenshot%207.png](readme/screenshot%207.png)

what does "implicit" mean exactly?

If we hover over `story` in line 9, it will show up as `mongoose.Document` even though we didnt manually type it. typescript can infer types by their usage / the right hand side of an expression.

Typescript is right again. We don't want to accept `any` type for a payload. We need a `Story` specifically, so lets create an explicit type for that.

```jsx
// stories.ts
import mongoose from "mongoose";

interface Story {
    title: string;
    effort: number;
    done: boolean;
}

const storySchema = new mongoose.Schema({ title: String, effort: Number, done: Boolean });
const StoryModel = mongoose.model("Story", storySchema);

export async function createStory(payload: Story) {
    const story = new StoryModel(payload);
    return story.save();
}

export async function getStories() {
    return await StoryModel.find({}).exec();
}
```
