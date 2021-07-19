import mongoose from "mongoose";

const connectionString = process.env.CONNECTION_STRING || '';

function connectDb() {
    return mongoose
        .connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log(`Connected to DB`);
        });
}

export default connectDb;
