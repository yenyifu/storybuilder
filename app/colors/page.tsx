import { ColorPalette } from "@/components/ui/color-palette";

export default function ColorsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-main mb-8">Color System Test</h1>
        <ColorPalette />

        <div className="mt-12 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold text-main mb-4">
            Color Usage Examples
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-main">Main Colors</h3>
              <div className="space-y-2">
                <div className="p-4 bg-main text-white rounded">
                  Main Background
                </div>
                <div className="p-4 bg-secondary text-main rounded">
                  Secondary Background
                </div>
                <div className="p-4 bg-accent text-main rounded">
                  Accent Background
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-main">Accent Colors</h3>
              <div className="space-y-2">
                <div className="p-4 bg-accent1 text-main rounded">Accent 1</div>
                <div className="p-4 bg-accent2 text-main rounded">Accent 2</div>
                <div className="p-4 bg-accent3 text-main rounded">Accent 3</div>
                <div className="p-4 bg-accent4 text-main rounded">Accent 4</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
