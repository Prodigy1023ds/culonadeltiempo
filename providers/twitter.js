const fetch = require('node-fetch');

// Returns unified items: { id, type: 'image'|'video'|'text', url, source, permalink, created }
async function fetchHashtag(tag){
  const BEARER = process.env.TWITTER_BEARER_TOKEN;
  if(!BEARER) return [];

  try{
    // Twitter API v2 recent search
    const q = encodeURIComponent(`#${tag} -is:retweet has:images OR has:videos`);
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${q}&expansions=attachments.media_keys,author_id&media.fields=url,preview_image_url,type&tweet.fields=created_at,attachments&user.fields=username&max_results=20`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${BEARER}` } });
    if(!r.ok) throw new Error('twitter error');
    const data = await r.json();

    const mediaMap = {};
    (data.includes && data.includes.media || []).forEach(m => { mediaMap[m.media_key] = m; });

    const items = (data.data || []).map(t => {
      const created = t.created_at ? new Date(t.created_at).getTime() : Date.now();
      let type = 'text';
      let url = null;
      if(t.attachments && t.attachments.media_keys && t.attachments.media_keys.length){
        const m = mediaMap[t.attachments.media_keys[0]];
        if(m){
          type = (m.type === 'video') ? 'video' : 'image';
          url = m.url || m.preview_image_url || null;
        }
      }
      return {
        id: `twitter_${t.id}`,
        type,
        url,
        source: 'twitter',
        permalink: `https://twitter.com/i/web/status/${t.id}`,
        text: t.text,
        created
      };
    });

    return items;
  }catch(e){
    console.warn('twitter provider failed', e.message || e);
    return [];
  }
}

module.exports = { fetchHashtag };
