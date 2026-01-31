const fetch = require('node-fetch');

// Instagram Graph API: requires IG_BUSINESS_ID and IG_ACCESS_TOKEN
// We'll fetch media from the business account and filter captions for the hashtag.
async function fetchHashtag(tag){
  const token = process.env.IG_ACCESS_TOKEN;
  const igId = process.env.IG_BUSINESS_ID;
  if(!token || !igId) return [];

  try{
    const url = `https://graph.facebook.com/v16.0/${igId}/media?fields=id,caption,media_url,media_type,timestamp,permalink&access_token=${token}&limit=40`;
    const r = await fetch(url);
    if(!r.ok) throw new Error('instagram error');
    const data = await r.json();

    const items = (data.data || []).filter(m => (m.caption || '').toLowerCase().includes(`#${tag.toLowerCase()}`)).map(m => ({
      id: `ig_${m.id}`,
      type: m.media_type === 'VIDEO' ? 'video' : 'image',
      url: m.media_url,
      source: 'instagram',
      permalink: m.permalink,
      text: m.caption,
      created: m.timestamp ? new Date(m.timestamp).getTime() : Date.now()
    }));

    return items;
  }catch(e){
    console.warn('instagram provider failed', e.message || e);
    return [];
  }
}

module.exports = { fetchHashtag };
