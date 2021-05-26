import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import React, { useState, useEffect } from 'react';
import { useSession, getSession, signIn } from 'next-auth/client'
import {liveChatMessagesList, liveBroadcastList} from '../lib/google'

export async function getLiveBroadcast(session) {
  const payload = await liveBroadcastList(session.accessToken, {
    part: 'snippet',
    broadcastStatus: 'active'
  });
  debugger;
  return payload.items[0];
}

export async function getLiveChatMessages(session, {liveBroadcast, nextPageToken}) {
  const {liveChatId} = liveBroadcast.snippet
  return liveChatMessagesList(session.accessToken, {
    liveChatId,
    part: 'snippet, authorDetails',
    pageToken: nextPageToken 
  })
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function pollLiveChatMessages({session, liveBroadcast, nextPageToken = ''}, cb) {
  const data = await getLiveChatMessages(session, {liveBroadcast, nextPageToken});

  if (data.items) {
    const newMessages = data.items.map((item) => {
      return {
        id: item.id,
        displayName: item.authorDetails.displayName,
        displayMessage: item.snippet.displayMessage
      }
    });
    cb(newMessages);
  }

  // Using the pollingInternalMillis burns through API call limit, check at most every 5 seconds
  await timeout(Math.max(5000, data.pollingIntervalMillis))
  // await pollLiveChatMessages({session, liveBroadcast, nextPageToken: data.nextPageToken}, cb);
}

async function startYoutubeChatFeed(messages, setMessages) {
  youtubeStarted = true;
  const session = await getSession();

  if (!session) return;

  const liveBroadcast = await getLiveBroadcast(session, {broadcastStatus: 'active'});
  await pollLiveChatMessages({session, liveBroadcast}, (newMessages) => {
    messages = messages.concat(newMessages)
    setMessages(messages);
  })
}

let youtubeStarted = false;




export default function Home() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, selectMessage] = useState(null)

  
  useEffect(async () => {
    const session = await getSession();
    if (!session) signIn('google');
    if (session && !youtubeStarted) startYoutubeChatFeed(messages, setMessages);
  }, []);

  function onSelectMessage(id) {
    const message = messages.find((m) => m.id === id);
  
    if (selectedMessage === id) {
      window.localStorage.setItem('streamfeed-live-message', JSON.stringify('{}'));
      selectMessage(null);
    } else {
      window.localStorage.setItem('streamfeed-live-message', JSON.stringify(message));
      selectMessage(id);
    }
  }
  
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <ul>
        {messages.map(({ displayName, displayMessage, id }) => (
          <li 
            className={`p-6 mb-10 bg-gray-700 hover:bg-indigo-700 cursor-pointer ring-indigo-700 text-white rounded-lg text-xl ${selectedMessage === id ? 'ring-4' : ''}`}
            key={id} 
            onClick={() => {onSelectMessage(id)}}
          >
            <p>
              <span className="font-extrabold">{displayName}: </span>
              <span>{displayMessage}</span>
            </p>
          </li>
        ))}
      </ul>
    </Layout>
  )
}