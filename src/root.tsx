// @refresh reload
import fs from 'fs'
import path from 'path'
import url from 'url'
import { useContext } from 'solid-js'
import { Body, Head, Html, Scripts } from 'solid-start'
import { ServerContext } from 'solid-start/server/ServerContext'
import type { ManifestEntry } from 'solid-start/server/types'
import './root.css'

const isDev = import.meta.env.MODE === 'development'
const readFileSync = (href: string) => {
  const file = url.fileURLToPath(new URL('./public/' + href.slice(1), import.meta.url))
  return fs.readFileSync(file).toString().trim()
}
const gtm =
  `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':` +
  `new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],` +
  `j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=` +
  `'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);` +
  `})(window,document,'script','dataLayer','GTM-TQQ8FKW');`

export default function Root() {
  const context = useContext(ServerContext)
  const assets = (isDev ? [] : context!.env.manifest!['entry-client']) as ManifestEntry[]
  return (
    <Html lang="en">
      <Head>
        <title>Snake</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta
          name="description"
          content="A free, online Snake game written in TypeScript with open source"
        />
        <meta name="keywords" content="Snake, Game, Online, Free, TypeScript, Open Source" />

        <meta property="og:title" content="Snake" />
        <meta
          property="og:description"
          content="A free, online Snake game written in TypeScript with open source"
        />
        <meta property="og:url" content="https://frenzzy.github.io/snake/" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image" content="https://frenzzy.github.io/snake/snake.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="675" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Snake" />

        <meta name="theme-color" content="#222738" />
        <link rel="manifest" href="https://frenzzy.github.io/snake/site.webmanifest" />
        <link rel="icon" href="https://frenzzy.github.io/snake/favicon.ico" sizes="any" />
        <link rel="icon" href="https://frenzzy.github.io/snake/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="https://frenzzy.github.io/snake/icon.png" />

        {!isDev && <script innerHTML={gtm} />}
        {!isDev && <style innerHTML={readFileSync(assets[1].href)} />}
      </Head>
      <Body>
        <noscript>
          <p>You need to enable JavaScript to run this app.</p>
          {!isDev && <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TQQ8FKW" />}
        </noscript>
        <canvas width={360} height={640} />
        {isDev && <Scripts />}
        {!isDev && <script innerHTML={readFileSync(assets[0].href)} />}
      </Body>
    </Html>
  )
}
