const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3';

export function liveChatMessagesList(token, params) {
  const url = new URL(`${YOUTUBE_API}/liveChat/messages`);
  url.search = new URLSearchParams(params).toString();
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
}

export function liveBroadcastList(token, params) {
  const url = new URL(`${YOUTUBE_API}/liveBroadcasts`);
  url.search = new URLSearchParams(params).toString();
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
}