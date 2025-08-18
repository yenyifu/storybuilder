import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Edit, Plus, Share } from "lucide-react";
import { colors } from "@/lib/colors";

export default function DashboardPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold" style={{ color: colors.main }}>
          My Dashboard
        </h1>
        <Button style={{ backgroundColor: colors.main }}>
          <Plus className="mr-2 h-4 w-4" /> Create New Book
        </Button>
      </div>

      <Tabs defaultValue="books" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="books" className="text-base py-3">
            <BookOpen className="mr-2 h-4 w-4" /> My Books
          </TabsTrigger>
          <TabsTrigger value="account" className="text-base py-3">
            Account Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Draft Book */}
            <Card className="overflow-hidden">
              <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                <img
                  src="/placeholder-qvyvp.png"
                  alt="Draft book"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">Hoppy's Big Adventure</h3>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Draft
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Last edited 2 days ago
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="mr-2 h-4 w-4" /> Continue
                  </Button>
                </div>
              </div>
            </Card>

            {/* Published Book */}
            <Card className="overflow-hidden">
              <div className="aspect-[4/3] bg-gray-100">
                <img
                  src="/colorful-space-childrens-book.png"
                  alt="Published book"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">Space Explorers</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Published
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Published on July 15, 2025
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <BookOpen className="mr-2 h-4 w-4" /> View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Share className="mr-2 h-4 w-4" /> Share
                  </Button>
                </div>
              </div>
            </Card>

            {/* Create New Book Card */}
            <Card className="overflow-hidden border-dashed">
              <div
                className="aspect-[4/3] flex items-center justify-center"
                style={{ backgroundColor: colors.accent3 }}
              >
                <div className="text-center p-6">
                  <div className="bg-white rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8" style={{ color: colors.main }} />
                  </div>
                  <h3 className="font-semibold" style={{ color: colors.main }}>
                    Create New Book
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Start a new story adventure
                  </p>
                </div>
              </div>
              <div className="p-4">
                <Link href="/create">
                  <Button
                    className="w-full"
                    style={{ backgroundColor: colors.main }}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="account">
          <Card className="p-6">
            <h2
              className="text-xl font-semibold mb-6"
              style={{ color: colors.main }}
            >
              Account Settings
            </h2>

            <div className="space-y-6 max-w-2xl">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Parent Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Sarah"
                      className="w-full p-3 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Johnson"
                      className="w-full p-3 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue="sarah@example.com"
                      className="w-full p-3 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      defaultValue="(555) 123-4567"
                      className="w-full p-3 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium">Children</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                    <div>
                      <h4 className="font-medium">Emma Johnson</h4>
                      <p className="text-sm text-gray-600">Age: 8</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                    <div>
                      <h4 className="font-medium">Noah Johnson</h4>
                      <p className="text-sm text-gray-600">Age: 6</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Child
                  </Button>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium">Shipping Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      defaultValue="123 Main Street"
                      className="w-full p-3 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      defaultValue="Apt 4B"
                      className="w-full p-3 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        defaultValue="Springfield"
                        className="w-full p-3 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        defaultValue="IL"
                        className="w-full p-3 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        defaultValue="62704"
                        className="w-full p-3 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button style={{ backgroundColor: colors.main }}>
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
