import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import React, { useState, useEffect } from 'react';
import { useSession, getSession, signIn } from 'next-auth/client'
import { io } from "socket.io-client"
import {liveChatMessagesList, liveBroadcastList} from '../lib/google'

export async function getLiveBroadcast(session) {
  const payload = await liveBroadcastList(session.accessToken, {
    part: 'snippet',
    broadcastStatus: 'active'
  });
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
    setMessages(prevMessages => ([...prevMessages, ...newMessages]));
  })
}

let youtubeStarted = false;

function useSocket(url) {
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const socketIo = io(url)

    setSocket(socketIo)

    function cleanup() {
      socketIo.disconnect()
    }
    return cleanup

    // should only run once and not on every re-render,
    // so pass an empty array
  }, [])

  return socket
}

export default function Home() {
  let messageEnd = null;
  let [messages, setMessages] = useState([]);
  const [selectedMessage, selectMessage] = useState(null)
  const socket = useSocket()
  
  useEffect(async () => {
    const session = await getSession();
    // if (!session) signIn('google');
    if (session && !youtubeStarted) startYoutubeChatFeed(messages, setMessages);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('github', handleGithubEvent)
      socket.on('twitter', handleTwitterEvent)
    }
  }, [socket])

  useEffect(() => {
    messageEnd.scrollIntoView({ behaviour: "smooth" });
  });

  function handleGithubEvent(payload) {
    setMessages(prevMessages => ([...prevMessages, {
      id: payload.discussion.id,
      displayName: payload.discussion.user.login,
      displayMessage: payload.discussion.title
    }]));
  }

  function handleTwitterEvent(payload) {
    setMessages(prevMessages => ([...prevMessages, {
      id: payload.data.id,
      displayName: payload.includes.users[0].name,
      displayMessage: payload.data.text
    }]));
  }

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
        <li ref={(element) => { messageEnd = element; }}></li>
      </ul>
    </Layout>
  )
}