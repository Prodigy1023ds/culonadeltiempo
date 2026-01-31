require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const twitter = require('./providers/twitter');
const instagram = require('./providers/instagram');
const facebook = require('./providers/facebook');
const tiktok = require('./providers/tiktok');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

const PORT = process.env.PORT || 3000;

// Simple in-memory cache to avoid flooding provider APIs
const cache = { data: null, tag: null, ts: 0, ttl: 30 * 1000 };

app.get('/feed', async (req, res) => {
  const tag = (req.query.tag || 'culonaxelmundo').replace(/^#/, '');

  // return cache when fresh and same tag
  if (cache.data && cache.tag === tag && (Date.now() - cache.ts) < cache.ttl) {
    return res.json({ source: 'cache', count: cache.data.length, items: cache.data });
  }

  try {
    // fetch providers in parallel
    const [tData, igData, fbData, ttData] = await Promise.all([
      twitter.fetchHashtag(tag),
      instagram.fetchHashtag(tag),
      facebook.fetchHashtag(tag),
      tiktok.fetchHashtag(tag)
    ]);

    // merge and normalize (providers return unified shape)
    const items = [].concat(tData || [], igData || [], fbData || [], ttData || []);

    // sort by created desc
    items.sort((a, b) => b.created - a.created);

    cache.data = items;
    cache.tag = tag;
    cache.ts = Date.now();

    res.json({ source: 'live', count: items.length, items });
  } catch (e) {
    console.error('Error building feed', e);
    res.status(500).json({ error: 'failed to build feed' });
  }
});

app.get('/', (req, res) => res.json({ ok: true, message: 'culonaxelmundo backend' }));

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
