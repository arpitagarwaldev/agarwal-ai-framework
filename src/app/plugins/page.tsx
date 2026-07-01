"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { PluginHero } from "@/components/plugins/PluginHero";
import { PackageGrid } from "@/components/plugins/PackageGrid";
import { InstallGuide } from "@/components/plugins/InstallGuide";
import { LiveDemo } from "@/components/plugins/LiveDemo";
import { APIReference } from "@/components/plugins/APIReference";
import { Footer } from "@/components/Footer";

export default function PluginsPage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <PluginHero />
      <PackageGrid />
      <InstallGuide />
      <LiveDemo />
      <APIReference />
      <Footer />
    </main>
  );
}
