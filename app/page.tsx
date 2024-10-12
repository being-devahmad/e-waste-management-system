import Image from "next/image";
import { ArrowRight, Leaf, Recycle, Users, Coins, MapPin, ChevronDown } from "lucide-react";
import { Button } from "../components/ui/button";
import Link from "next/link";
import React from "react";


function AnimatedGlobe() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-8">
      <div className="absolute rounded-full bg-green-500 opacity-20 inset-0 animate-pulse"></div>
      <div className="absolute rounded-full bg-green-400 opacity-40 inset-2 animate-ping"></div>
      <div className="absolute rounded-full bg-green-300 opacity-60 inset-4 animate-spin"></div>
      <div className="absolute rounded-full bg-green-200 opacity-80 inset-6 animate-bounce"></div>
      <Leaf className="absolute inset-0 m-auto h-16 w-16 text-green-600 animate-pulse" />
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col items-center text-center">
      <div className="bg-green-100 p-4 rounded-full mb-6 ">
        <Icon className={'h-8 w-8 text-green-600'} />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}


export default function Home() {
  return (
    <>
      <div className="container mx-auto px-4 py-16 ">
        <section className="text-center mb-20">
          <AnimatedGlobe />
          <h1 className="text-6xl font-bold mb-6 text-gray-800 tracking-tight">
            E-Waste <span className="text-green-600">Management Sytem</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Join our community in making waste management more efficient and rewarding!
          </p>
          <Button className="bg-green-600 hover:bg-green-700 text-white text-lg py-6 px-10 rounded-full">
            Report Waste
          </Button>
        </section>

        <section className="grid md:grid-cols-3 gap-10 mb-20">
          <FeatureCard
            icon={Leaf}
            title="Eco Friendly"
            description="We are committed to reducing waste and promoting sustainability" />

          <FeatureCard
            icon={Coins}
            title="Earn Rewards"
            description="We are committed to reducing waste and promoting sustainability" />

          <FeatureCard
            icon={Leaf}
            title="Community Driven"
            description="We are committed to reducing waste and promoting sustainability" />
        </section>
      </div>
    </>
  );
}
