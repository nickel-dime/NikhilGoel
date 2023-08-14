import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import Head from "next/head";
import { data } from ".";
import BubbleElement from "./test";

export default function Projects() {
  const options = {
    size: 160,
    minSize: 20,
    gutter: 2,
    provideProps: true,
    numCols: 8,
    fringeWidth: 80,
    yRadius: 80,
    xRadius: 80,
    cornerRadius: 50,
    showGuides: false,
    compact: true,
    gravitation: 8,
  };

  const children = data
    .concat(data)
    .concat(data)
    .concat(data)
    .concat(data)
    .concat(data)
    .concat(data)
    .concat(data)
    .concat(data)
    .concat(data)
    .concat(data)
    .map((data_prop, i) => {
      return <Child data={data_prop} className="child" key={i}></Child>;
    });

  return (
    <c>
      <Head>
        <title>Nikhil Goel</title>
        <meta name="description" content="Personal website for Nikhil Goel" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <div className="flex flex-col gap-4">
          <div className="mt-10 text-4xl font-bold">Projects</div>
          <div className="">
            A collection of projects I've designed, prototyped and developed.
          </div>
          <div className="mt-3 grid-cols-1 grid gap-8 mb-10">
            <Card></Card>
            <Card></Card>
            <Card></Card>
            <Card></Card>
            <Card></Card>
            <Card></Card>
            <Card></Card>
          </div>
        </div>
      </Container>
    </c>
  );
}

function Child({ data }) {
  return (
    <div className="childComponent" onClick={() => console.log(data)}>
      {data}
    </div>
  );
}
