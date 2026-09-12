"use client";
import Image from "next/image";
import Button from "../button/button.component";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();

  return (
    <div className="w-full h-full min-h-[calc(100svh-1rem)] overflow-hidden relative rounded-lg flex flex-col items-center justify-center lg:px-60 px-10">
      <Image
        src={"/images/homepage.jpg"}
        alt="Homepage Image"
        sizes="100vh"
        fill
        objectFit="cover"
        objectPosition="center"
      />
      <div className="w-full h-full bg-black/40 top-0 left-0 absolute"></div>
      <div className="text-white z-20 text-center">
        <h1 className="text-3xl">
          Great food, one reservation away, <br />
          where great food meats begin.
        </h1>
        <p className="text-lg lg:text-xl py-4">
          Whatever the occasion, finding the perfect restaurant should be
          simple. Browse restaurants you&#39;ll love, see available tables
          instantly, and book with condence in just a few taps.
        </p>
        <Button variant="primary" onClick={() => router.push("/restaurants")}>
          Find a Restaurant
        </Button>
      </div>
    </div>
  );
};

export default Hero;
