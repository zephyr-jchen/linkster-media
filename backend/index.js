const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

const pool = require('./db');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');
const userLikes = require('./routes/likes');
const uploadRoutes = require('./routes/uploads');
app.use(express.json());

// app.get('/', (req, res) => {
//   res.send('Hello from social media!');
// });


app.use(express.static(path.join(__dirname, '../frontend')));

// app.get('/', (req, res) => {
//   const html = fs.readFileSync(path.join(__dirname, '../frontend/login.html'), 'utf-8');
//   const podName = process.env.HOSTNAME || 'unknown-pod';
//   const htmlWithPod = html.replace('</body>', `<!-- Pod: ${podName} --></body>`);
//   res.send(htmlWithPod);
// });
app.get('/', (req, res) => {
  res.sendFile('login.html', { root: path.join(__dirname, '../frontend') });
});

app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/likes', userLikes);

app.use('/api/uploads', uploadRoutes);


app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
