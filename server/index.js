import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// In-Memory Cloud SQL Fallback Store (for local testing & demonstration)
let mockVideos = [];
let mockComments = [];
let mockOrders = [];

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'DGMD Academy Cloud Run App', timestamp: new Date() });
});

// Get Video Lessons
app.get('/api/videos', (req, res) => {
  res.json({ videos: mockVideos });
});

// Admin Add Video Lesson
app.post('/api/videos', (req, res) => {
  const { title, moduleTitle, duration, thumbnailUrl, videoUrl, isFreePreview, price } = req.body;
  const newVideo = {
    id: `les_${Date.now()}`,
    moduleId: 'mod_custom',
    moduleTitle: moduleTitle || 'Module Custom',
    title,
    duration: duration || '15:00',
    thumbnailUrl,
    videoUrl,
    isFreePreview: Boolean(isFreePreview),
    price: Number(price) || 19.99,
    createdAt: new Date()
  };
  mockVideos.unshift(newVideo);
  res.status(201).json({ message: 'Video added successfully', video: newVideo });
});

// Get Comments
app.get('/api/comments', (req, res) => {
  res.json({ comments: mockComments });
});

// Post Comment
app.post('/api/comments', (req, res) => {
  const { lessonId, userId, userName, userAvatar, content } = req.body;
  const newComment = {
    id: `cmt_${Date.now()}`,
    lessonId,
    userId: userId || 'usr_guest',
    userName: userName || 'Học viên',
    userAvatar: userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    content,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  mockComments.unshift(newComment);
  res.status(201).json({ message: 'Comment submitted for approval', comment: newComment });
});

// Admin Moderate Comment Status
app.patch('/api/comments/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' | 'rejected'
  const cmt = mockComments.find(c => c.id === id);
  if (cmt) {
    cmt.status = status;
    return res.json({ message: 'Comment status updated', comment: cmt });
  }
  res.status(404).json({ error: 'Comment not found' });
});

// Serve Static React Build Output for Cloud Run
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 DGMD Academy Server running on port ${PORT}`);
});
