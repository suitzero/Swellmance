const express = require('express');
const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-development-secret';

app.use(express.json());

// Middleware to authenticate users
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

app.get('/', (req, res) => {
  res.send('Hello from the Swellmance backend!');
});

app.post('/register', async (req, res) => {
  const { email, password, name, gender } = req.body;

  if (!email || !password || !name || !gender) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        gender,
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during registration.' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});

// Surf Spot Endpoints
app.post('/surf-spots', authenticate, async (req, res) => {
  const { name, location } = req.body;
  try {
    const surfSpot = await prisma.surfSpot.create({ data: { name, location } });
    res.status(201).json(surfSpot);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while creating the surf spot.' });
  }
});

app.get('/surf-spots', authenticate, async (req, res) => {
  try {
    const surfSpots = await prisma.surfSpot.findMany();
    res.json(surfSpots);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching surf spots.' });
  }
});

app.post('/me/surf-spots', authenticate, async (req, res) => {
  const { surfSpotId } = req.body;
  try {
    await prisma.user.update({
      where: { id: req.userId },
      data: {
        preferredSpots: {
          connect: { id: surfSpotId },
        },
      },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while adding the surf spot.' });
  }
});

app.get('/me/surf-spots', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { preferredSpots: true },
    });
    res.json(user.preferredSpots);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching preferred surf spots.' });
  }
});

// Matching Endpoint
app.get('/matches', authenticate, async (req, res) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { preferredSpots: true },
    });

    const preferredSpotIds = currentUser.preferredSpots.map((spot) => spot.id);

    const potentialMatches = await prisma.user.findMany({
      where: {
        id: { not: req.userId },
        gender: { not: currentUser.gender },
        preferredSpots: {
          some: {
            id: { in: preferredSpotIds },
          },
        },
      },
    });

    res.json(potentialMatches);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching matches.' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
