import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import React, { useEffect, useState } from 'react';
import utilStyles from '../styles/utils.module.css'
import { signIn, signOut, useSession, getSession } from 'next-auth/client'
import {liveChatMessagesList, liveBroadcastList} from '../lib/google'

export async function getLiveBroadcast(session) {
  const response = await liveBroadcastList(session.accessToken, {
    part: 'snippet',
    mine: true
  });

  const body = await response.json();
  return body.items[0];
}

export async function getLiveChatMessages(session, {liveBroadcast, nextPageToken}) {
  const {liveChatId} = liveBroadcast.snippet
  const response = await liveChatMessagesList(session.accessToken, {
    liveChatId,
    part: 'snippet, authorDetails',
    pageToken: nextPageToken 
  })
  return response.json();
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function pollLiveChatMessages({session, liveBroadcast, nextPageToken = ''}, cb) {
  const data = await getLiveChatMessages(session, {liveBroadcast, nextPageToken});

  const newMessages = data.items.map((item) => {
    return {
      id: item.id,
      displayName: item.authorDetails.displayName,
      displayMessage: item.snippet.displayMessage
    }
  });
  cb(newMessages);

  // Using the pollingInternalMillis burns through API call limit, check at most every 5 seconds
  await timeout(Math.max(5000, data.pollingIntervalMillis))
  await pollLiveChatMessages({session, liveBroadcast, nextPageToken: data.nextPageToken}, cb);
}

async function startYoutubeChatFeed(messages, setMessages) {
  youtubeStarted = true;
  const session = await getSession();

  debugger;

  if (!session) return;

  const liveBroadcast = await getLiveBroadcast(session);
  await pollLiveChatMessages({session, liveBroadcast}, (newMessages) => {
    messages = messages.concat(newMessages)
    setMessages(messages);
  })
}

let youtubeStarted = false;


function showMessage(id, messages) {
  const message = messages.find((m) => m.id === id);
  const currentMessage = JSON.parse(window.localStorage.getItem('streamfeed-live-message') || '{}');

  if (currentMessage.id === id) {
    window.localStorage.setItem('streamfeed-live-message', JSON.stringify('{}'));
  } else {
    window.localStorage.setItem('streamfeed-live-message', JSON.stringify(message));
  }
}

export default function Home() {
  const [session, loading ] = useSession();
  const [messages, setMessages] = useState([]);

  if (session && !youtubeStarted) startYoutubeChatFeed(messages, setMessages);
  
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        {!session && <>
          Not signed in <br/>
          <button onClick={() => signIn()}>Sign in</button>
        </>}

        {session && <>
          Signed in as {session.user.email} <br/>
          <button onClick={() => signOut()}>Sign out</button>

          <h1>StreamFeed</h1>
          <ul className={utilStyles.list}>
            {messages.map(({ displayName, displayMessage, id }) => (
              <li className={utilStyles.listItem} key={id} onClick={() => {showMessage(id, messages)}}>
                <p><span>{displayName}: </span><span>{displayMessage}</span></p>
              </li>
            ))}
          </ul>
        </>}
      </section>
    </Layout>
  )
}