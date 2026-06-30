"use client";

import { Hero } from "@/components/Hero";
import { AgarwalGraph } from "@/components/AgarwalGraph";
import { Pillars } from "@/components/Pillars";
import { Architecture } from "@/components/Architecture";
import { Metrics } from "@/components/Metrics";
import { MaturityModel } from "@/components/MaturityModel";
import { FutureHorizons } from "@/components/FutureHorizons";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ParticleField } from "@/components/ParticleField";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <ParticleField />
      <Navbar />
      <Hero />
      <AgarwalGraph />
      <Pillars />
      <Architecture />
      <Metrics />
      <MaturityModel />
      <FutureHorizons />
      <Footer />
    </main>
  );
}
