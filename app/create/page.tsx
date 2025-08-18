import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, BookOpen, Palette, Save } from 'lucide-react';
import Link from "next/link";

export default function CreatePage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-purple-800">Create Your Story</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Save className="mr-2 h-4 w-4" /> Save Draft
          </Button>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
            Preview
          </Button>
        </div>
      </div>

      <Tabs defaultValue="write" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="write" className="text-base py-3">
            <BookOpen className="mr-2 h-4 w-4" /> Write Story
          </TabsTrigger>
          <TabsTrigger value="illustrate" className="text-base py-3">
            <Palette className="mr-2 h-4 w-4" /> Create Illustrations
          </TabsTrigger>
          <TabsTrigger value="publish" className="text-base py-3">
            <ArrowRight className="mr-2 h-4 w-4" /> Publish & Share
          </TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-4 text-purple-800">Tell Your Story</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Story Title</label>
                    <input
                      type="text"
                      placeholder="Enter a title for your story"
                      className="w-full p-3 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Story Content</label>
                    <textarea
                      placeholder="Once upon a time..."
                      className="w-full p-3 border border-gray-300 rounded-md h-64"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="md:w-1/3 bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-purple-800">AI Assistant</h3>
                <div className="bg-white p-4 rounded-md mb-4 shadow-sm">
                  <p className="text-sm text-gray-700">
                    Your story is coming along nicely! Would you like to add more details about the main character?
                  </p>
                </div>
                <div className="bg-purple-100 p-4 rounded-md mb-4">
                  <p className="text-sm text-purple-800">
                    Maybe describe what they look like or what they enjoy doing?
                  </p>
                </div>
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Ask the AI for help..."
                    className="w-full p-3 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Continue to Illustrations <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="illustrate">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-purple-800">Create Illustrations</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Page 1</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    "Once upon a time, there was a brave little rabbit named Hoppy who lived in a cozy burrow at the edge of the Whispering Forest."
                  </p>
                  <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Generate Illustration
                    </Button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Page 2</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    "Every morning, Hoppy would hop out of bed and go on adventures through the magical forest."
                  </p>
                  <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Generate Illustration
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-purple-800">Illustration Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Art Style</label>
                    <select className="w-full p-3 border border-gray-300 rounded-md">
                      <option>Watercolor</option>
                      <option>Cartoon</option>
                      <option>Pencil Sketch</option>
                      <option>Digital Art</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Customize Image</label>
                    <textarea
                      placeholder="Add specific details for this illustration..."
                      className="w-full p-3 border border-gray-300 rounded-md h-24"
                    ></textarea>
                  </div>
                  
                  <div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Apply Changes
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Writing
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Continue to Publishing <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="publish">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-purple-800">Publish Your Book</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="bg-purple-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-purple-800">Book Preview</h3>
                  <div className="aspect-[4/3] bg-white rounded-lg shadow-lg flex items-center justify-center">
                    <img 
                      src="/rabbit-childrens-book-preview.png" 
                      alt="Book preview" 
                      className="rounded-lg"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <Button variant="outline" size="sm">
                      View Full Preview
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-800">Book Details</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">Author Name</label>
                    <input
                      type="text"
                      placeholder="Your child's name"
                      className="w-full p-3 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Dedication (Optional)</label>
                    <input
                      type="text"
                      placeholder="For Grandma with love..."
                      className="w-full p-3 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 text-purple-800">Publishing Options</h3>
                
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Digital Book</h4>
                        <p className="text-sm text-gray-600">Share online or download as PDF</p>
                      </div>
                      <div className="text-lg font-semibold text-purple-800">Free</div>
                    </div>
                  </div>
                  
                  <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Softcover Book</h4>
                        <p className="text-sm text-gray-600">8.5" x 8.5", 24 pages, full color</p>
                      </div>
                      <div className="text-lg font-semibold text-purple-800">$14.99</div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Hardcover Book</h4>
                        <p className="text-sm text-gray-600">8.5" x 8.5", 24 pages, premium paper</p>
                      </div>
                      <div className="text-lg font-semibold text-purple-800">$24.99</div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Continue to Checkout
                    </Button>
                    <p className="text-xs text-center mt-2 text-gray-500">
                      You'll have a chance to review before finalizing your order
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
