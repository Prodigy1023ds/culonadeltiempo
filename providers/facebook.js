const fetch = require('node-fetch');

// Facebook Graph API: requires FB_PAGE_ID and FB_ACCESS_TOKEN
async function fetchHashtag(tag){
  const token = process.env.FB_ACCESS_TOKEN;
  const pageId = process.env.FB_PAGE_ID;
  if(!token || !pageId) return [];

  try{
    const url = `https://graph.facebook.com/v16.0/${pageId}/posts?fields=id,message,full_picture,created_time,permalink_url&access_token=${token}&limit=40`;
    const r = await fetch(url);
    if(!r.ok) throw new Error('facebook error');
    const data = await r.json();

    const items = (data.data || []).filter(p => (p.message||'').toLowerCase().includes(`#${tag.toLowerCase()}`)).map(p => ({
      id: `fb_${p.id}`,
      type: p.full_picture ? 'image' : 'text',
      url: p.full_picture || null,
      source: 'facebook',
      permalink: p.permalink_url,
      text: p.message,
      created: p.created_time ? new Date(p.created_time).getTime() : Date.now()
    }));

    return items;
  }catch(e){
    console.warn('facebook provider failed', e.message || e);
    return [];
  }
}

module.exports = { fetchHashtag };
