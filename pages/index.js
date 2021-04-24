import Head from 'next/head'
import Link from 'next/link'
import Layout, { siteTitle } from '../components/layout'
import Date from '../components/date'
import utilStyles from '../styles/utils.module.css'
import { signIn, signOut, useSession, getSession } from 'next-auth/client'
import {google} from 'googleapis'

async function getLiveBroadcast(session) {
  const youtube = google.youtube({
    version: 'v3',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  const {data} = await youtube.liveBroadcasts.list({
    part: 'snippet',
    mine: true
  });

  return data.items[0];
}

async function getLiveChatMessages(session, liveBroadcast) {
  const youtube = google.youtube({
    version: 'v3',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  const {liveChatId} = liveBroadcast.snippet
    const response = await youtube.liveChatMessages.list({
      liveChatId,
      part: 'snippet, authorDetails' 
    })
    return response.data.items.map(({ snippet, authorDetails }) => {
      return {
        displayName: authorDetails.displayName,
        displayMessage: snippet.displayMessage
      }
    });
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) return {props: {}};

  const liveBroadcast = await getLiveBroadcast(session);

  if (!liveBroadcast) return {props: {}};

  const messages = await getLiveChatMessages(session, liveBroadcast);

  return {
    props: {
      liveBroadcast,
      messages 
    }
  }
}

export default function Home({ liveBroadcast, messages }) {
  const [ session, loading ] = useSession();

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

          {liveBroadcast && <> 
            <h1>Your Youtube Live stream is active!</h1>

            <ul className={utilStyles.list}>
              {messages.map(({ displayName, displayMessage }) => (
                <li className={utilStyles.listItem}>
                  <p>{displayName}: </p>
                  <p>{displayMessage}</p>
                </li>
              ))}
            </ul>
          </>}
          {!liveBroadcast && <> 
            <h1>Your Youtube Live stream is NOT active!</h1>
          </>}
        </>}
      </section>
    </Layout>
  )
}