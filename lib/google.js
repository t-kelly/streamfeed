let YOUTUBE_API = 'https://www.googleapis.com/youtube/v3';

if (process.env.NEXT_PUBLIC_USE_FIXTURE_DATA && typeof window !== 'undefined') {
  YOUTUBE_API = `${window.location.origin}/api/mock/youtube`
}

export async function liveChatMessagesList(token, params) {
  const url = new URL(`${YOUTUBE_API}/liveChat/messages`);
  url.search = new URLSearchParams(params).toString();

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })

  return response.json();
}

export async function liveBroadcastList(token, params) {
  const url = new URL(`${YOUTUBE_API}/liveBroadcasts`);
  url.search = new URLSearchParams(params).toString();

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })

  return response.json();
}