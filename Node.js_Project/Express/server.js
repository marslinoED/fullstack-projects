const express = require('express');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Hello, Express! GET');
});
app.post('/', (req, res) => {
  res.send('Hello, Express! POST');
});
app.patch('/', (req, res) => {
  res.send('Hello, Express! PATCH');
});
app.delete('/', (req, res) => {
  res.send('Hello, Express! DELETE');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});