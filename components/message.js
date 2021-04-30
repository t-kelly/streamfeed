import React, { useEffect, useState } from 'react';
import utilStyles from '../styles/utils.module.css'


export default function Message(props) {


  return (
    <section className={utilStyles["obs-card"]}>
      <div className={utilStyles["obs-card__title"]}>
        <span>{props.title}</span>
      </div>
      <div className={utilStyles["obs-card__message"]}>
        <span>{props.content}</span>
      </div>
    </section>
  )
}