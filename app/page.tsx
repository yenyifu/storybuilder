import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Gift, Palette, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { colors } from "@/lib/colors";

export default function Home() {
  redirect("/story-builder");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-accent3 to-white py-16 px-4 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="flex-1 space-y-6">
              <h1
                className="text-4xl md:text-6xl font-bold leading-tight"
                style={{ color: colors.main }}
              >
                Turn your child&apos;s imagination into beautiful storybooks
              </h1>
              <p className="text-lg md:text-xl text-gray-700">
                Create, illustrate, and publish professional-quality storybooks
                with your kids. Our AI-powered platform makes it easy and fun!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" style={{ backgroundColor: colors.main }}>
                  Start Creating <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  See Examples
                </Button>
              </div>
            </div>
            <div className="flex-1 mt-8 md:mt-0">
              <div className="relative">
                <img
                  src="/kids-reading-storybook.png"
                  alt="Children's storybook example"
                  className="rounded-lg shadow-xl"
                />
                <div className="absolute -bottom-6 -right-6 bg-white p-3 rounded-lg shadow-lg">
                  <Sparkles className="h-10 w-10 text-yellow-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ color: colors.main }}
          >
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <BookOpen
                    className="h-10 w-10"
                    style={{ color: colors.main }}
                  />
                ),
                title: "Write Your Story",
                description:
                  "Type your story with guidance from our AI assistant to help structure your ideas.",
              },
              {
                icon: (
                  <Palette
                    className="h-10 w-10"
                    style={{ color: colors.main }}
                  />
                ),
                title: "Create Illustrations",
                description:
                  "Our AI generates beautiful, custom illustrations based on your story text.",
              },
              {
                icon: (
                  <Gift className="h-10 w-10" style={{ color: colors.main }} />
                ),
                title: "Publish & Share",
                description:
                  "Order printed copies or share digital versions with family and friends.",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-xl"
                style={{ backgroundColor: colors.accent3 }}
              >
                <div className="bg-white p-4 rounded-full mb-4 shadow-md">
                  {step.icon}
                </div>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: colors.main }}
                >
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        className="py-16 px-4"
        style={{ backgroundColor: colors.accent3 }}
      >
        <div className="container mx-auto max-w-6xl">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ color: colors.main }}
          >
            Features Parents & Kids Love
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "AI-Powered Illustrations",
                description:
                  "Transform your child's story into beautiful illustrations with our AI technology.",
              },
              {
                title: "Guided Story Creation",
                description:
                  "Our chat-based interface helps kids structure their stories with helpful prompts.",
              },
              {
                title: "Multiple Book Formats",
                description:
                  "Choose from different sizes and quality options for your printed books.",
              },
              {
                title: "Safe & Supervised",
                description:
                  "Parent-controlled publishing and age-appropriate content filtering.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex p-6 bg-white rounded-xl shadow-sm"
              >
                <div
                  className="mr-4 rounded-full p-3 h-fit"
                  style={{ backgroundColor: colors.accent1 }}
                >
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: colors.main }}
                  >
                    {index + 1}
                  </div>
                </div>
                <div>
                  <h3
                    className="text-xl font-semibold mb-2"
                    style={{ color: colors.main }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-16 px-4 text-white"
        style={{ backgroundColor: colors.main }}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to create magical stories with your kids?
          </h2>
          <p
            className="text-lg md:text-xl mb-8"
            style={{ color: colors.accent4 }}
          >
            Start for free and only pay when you're ready to publish.
          </p>
          <Button
            size="lg"
            className="bg-white hover:bg-gray-100"
            style={{ color: colors.main }}
          >
            Create Your First Book
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold" style={{ color: colors.main }}>
                KidsBookCreator
              </h3>
              <p className="text-gray-600 mt-2">
                Turning imagination into stories
              </p>
            </div>
            <div className="flex gap-8">
              <Link
                href="/about"
                className="text-gray-600 hover:text-purple-800"
              >
                About
              </Link>
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-purple-800"
              >
                Pricing
              </Link>
              <Link href="/faq" className="text-gray-600 hover:text-purple-800">
                FAQ
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-purple-800"
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500">
            <p>© 2025 KidsBookCreator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
