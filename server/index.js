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

// AI Matchmaker Endpoint (Mock AI)
app.post('/ai-matchmaker', authenticate, async (req, res) => {
  const { story } = req.body;
  if (!story) {
    return res.status(400).json({ error: 'Story is required.' });
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { preferredSpots: true },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Basic "AI" logic: find surf spots mentioned in the story
    const allSpots = await prisma.surfSpot.findMany();
    const mentionedSpots = allSpots.filter(spot =>
      story.toLowerCase().includes(spot.name.toLowerCase()) ||
      story.toLowerCase().includes(spot.location.toLowerCase())
    );

    // If we didn't find any spots in the story, but the user has preferred spots, use those.
    // If neither, then we can't match.
    let searchSpotIds = mentionedSpots.map(s => s.id);
    if (searchSpotIds.length === 0 && currentUser.preferredSpots.length > 0) {
      searchSpotIds = currentUser.preferredSpots.map(s => s.id);
    }

    let responseMessage = '';
    let matches = [];

    if (searchSpotIds.length > 0) {
      // Find potential matches based on spots and opposite gender
      matches = await prisma.user.findMany({
        where: {
          id: { not: req.userId },
          gender: { not: currentUser.gender },
          preferredSpots: {
            some: {
              id: { in: searchSpotIds },
            },
          },
        },
        select: {
          id: true,
          name: true,
          gender: true,
          preferredSpots: true
        }
      });

      if (matches.length > 0) {
        responseMessage = `Based on your story, I see you like surfing around ${mentionedSpots.map(s => s.name).join(', ') || 'your preferred spots'}. I found ${matches.length} amazing surfer(s) you might hit it off with!`;
      } else {
        responseMessage = `I noticed you like surfing around ${mentionedSpots.map(s => s.name).join(', ') || 'your preferred spots'}, but I couldn't find any matches right now. Keep shredding!`;
      }
    } else {
      responseMessage = "I couldn't quite tell which surf spots you were talking about in your story. Maybe mention a spot like 'Bondi Beach' next time?";
    }

    res.json({
      message: responseMessage,
      matches,
      extractedSpots: mentionedSpots
    });
  } catch (error) {
    console.error('AI Matchmaker Error:', error);
    res.status(500).json({ error: 'An error occurred while matching.' });
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
