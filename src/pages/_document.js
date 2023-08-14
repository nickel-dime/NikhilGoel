import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossorigin
        ></link>
        <link
          href={
            "https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap"
          }
          rel="stylesheet"
        ></link>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
