import Head from 'next/head'
import Message from '../components/message'
import { siteTitle } from '../components/layout'
import React, { useEffect, useState } from 'react';
import { Transition } from '@headlessui/react'

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
      <main className="relative" style={{width: `${1920}px`, height: `${1080}px`}}>
        <Transition
          show={showMessage && typeof message.id !== 'undefined'}
          appear={true}
          enter="transition transform opacity duration-150 origin-bottom-left"
          enterFrom="opacity-0 scale-90"
          enterTo="opacity-100"
          leave="transition transform opacity duration-100 origin-bottom-left"
          leaveFrom="opacity-100"
          leaveTo="opacity-0 scale-90"
          afterLeave={updateMessage}
          className="absolute bottom-16 left-8 right-5"
        >
          <Message 
            title={message.displayName} 
            content={message.displayMessage}
          ></Message>  
        </Transition>
      </main>
    </>
  )
}