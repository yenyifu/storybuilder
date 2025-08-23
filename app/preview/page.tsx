"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Download, Printer, Share } from 'lucide-react';

export default function BookPreviewPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 8;
  
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Sample book pages
  const bookPages = [
    {
      type: "cover",
      title: "Hoppy's Big Adventure",
      author: "By Emma Johnson",
      image: "/rabbit-book-cover.png"
    },
    {
      type: "page",
      text: "Once upon a time, there was a brave little rabbit named Hoppy who lived in a cozy burrow at the edge of the Whispering Forest.",
      image: "/rabbit-burrow-forest-edge.png"
    },
    {
      type: "page",
      text: "Every morning, Hoppy would hop out of bed and go on adventures through the magical forest.",
      image: "/magical-forest-rabbit.png"
    },
    {
      type: "page",
      text: "One day, Hoppy discovered a hidden path that led to a sparkling blue pond he had never seen before.",
      image: "/placeholder-rjlvn.png"
    },
    {
      type: "page",
      text: "At the pond, Hoppy met a friendly turtle named Slowpoke who was looking for his lost shell decoration.",
      image: "/rabbit-turtle-pond.png"
    },
    {
      type: "page",
      text: "Hoppy promised to help find the missing decoration. They searched high and low throughout the forest.",
      image: "/forest-search.png"
    },
    {
      type: "page",
      text: "Finally, they found the shiny shell decoration caught in a spider's web high up in an oak tree.",
      image: "/placeholder.svg?height=300&width=400"
    },
    {
      type: "back",
      text: "The End",
      image: "/placeholder.svg?height=300&width=400"
    }
  ];
  
  const currentPageData = bookPages[currentPage];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-primary">Book Preview</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          <Button variant="outline" size="sm">
            <Share className="mr-2 h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <Card className="w-full max-w-2xl overflow-hidden shadow-lg">
          {currentPageData.type === "cover" && (
            <div className="bg-brand-50 p-8 flex flex-col items-center">
              <img 
                src={currentPageData.image || "/placeholder.svg"} 
                alt="Book cover" 
                className="w-full max-w-md rounded-lg shadow-md mb-8"
              />
              <h2 className="text-3xl font-bold text-primary text-center mb-4">
                {currentPageData.title}
              </h2>
              <p className="text-xl text-gray-700">{currentPageData.author}</p>
            </div>
          )}
          
          {currentPageData.type === "page" && (
            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="md:w-1/2">
                  <img 
                    src={currentPageData.image || "/placeholder.svg"} 
                    alt="Story illustration" 
                    className="rounded-lg shadow-md w-full"
                  />
                </div>
                <div className="md:w-1/2">
                  <p className="text-lg leading-relaxed text-gray-800">
                    {currentPageData.text}
                  </p>
                </div>
              </div>
              <div className="text-center mt-6 text-gray-500">
                Page {currentPage} of {totalPages - 1}
              </div>
            </div>
          )}
          
          {currentPageData.type === "back" && (
            <div className="bg-brand-50 p-8 flex flex-col items-center">
              <img 
                src={currentPageData.image || "/placeholder.svg"} 
                alt="Back cover" 
                className="w-full max-w-md rounded-lg shadow-md mb-8"
              />
              <h2 className="text-3xl font-bold text-primary text-center">
                {currentPageData.text}
              </h2>
            </div>
          )}
        </Card>
        
        <div className="flex justify-center mt-8 gap-4">
          <Button 
            onClick={goToPrevPage} 
            disabled={currentPage === 0}
            variant="outline"
            size="lg"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button 
            onClick={goToNextPage} 
            disabled={currentPage === totalPages - 1}
            variant="outline"
            size="lg"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <Button className="bg-primary hover:bg-brand-700" size="lg">
          Publish This Book
        </Button>
        <p className="text-sm text-gray-600 mt-2">
          Ready to share your story with the world?
        </p>
      </div>
    </div>
  );
}
