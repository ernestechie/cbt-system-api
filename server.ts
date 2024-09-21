import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({
  path: './config.env',
});

import app from './app';

const DB = process.env.MONGODB_DATABASE as string;

mongoose
  .connect(DB)
  .then((res) => {
    console.log('\n 🚀 MONGODB -> Connection successful. 🚀 \n');
  })
  .catch((err) => {
    console.log('Error: ', err);
  });

// Start the server
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`App running on port -> ${port}`);
});
