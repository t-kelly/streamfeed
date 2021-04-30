import Head from 'next/head'
import Message from '../components/message'
import { siteTitle } from '../components/layout'
import React, { useEffect, useState } from 'react';
import utilStyles from '../styles/utils.module.css'
import { CSSTransition } from 'react-transition-group';

export default function OBS() {
  const [message, setMessage] = useState({});
  const [showMessage, setShowMessage] = useState(false);
  let pendingMessage = {};

  useEffect(() => {
    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    }
  });

  async function handleStorageEvent({key, newValue}) {
    if (key !== 'streamfeed-live-message') return;
    pendingMessage = JSON.parse(newValue);

    if (!showMessage && pendingMessage.id) {
      setMessage(pendingMessage);
      setShowMessage(true)
    } else {
      setShowMessage(false)
    }
  }

  function updateMessage() {
    const newMessage = JSON.parse(window.localStorage.getItem('streamfeed-live-message'))
    setMessage(newMessage);

    if (newMessage.id) {
      setShowMessage(true)
    }
  }

  return (
    <>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <CSSTransition
        in={showMessage && typeof message.id !== 'undefined'}
        timeout={300}
        appear={true}
        classNames={{ 
          enter: utilStyles["obs-card-enter"],
          enterActive: utilStyles["obs-card-enter-active"],
          exit: utilStyles["obs-card-exit"],
          exitActive: utilStyles["obs-card-exit-active"],
        }}
        unmountOnExit
        onExited={updateMessage}
      >
        <Message title={message.displayName} content={message.displayMessage}></Message>  
      </CSSTransition>
    </>
  )
}