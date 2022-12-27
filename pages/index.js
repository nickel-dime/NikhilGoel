import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>Nikhil</title>
        <meta name="description" content="Personal website for Nikhil Goel" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.header}>
          THIS IS AMERICA
        </div>
        <Image src={'/static/images/thisisamerica.png'} width={300} height={400} alt="This is America cover">

        </Image>
        <div className={styles.description}>
          <div>
            CHILDISH GAMBINO
          </div>
          <div style={{ padding: '10px'}}>
            10.10.23
          </div>
        </div>
      </main>
    </>
  )
}
