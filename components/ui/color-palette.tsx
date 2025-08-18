import { colors } from "@/lib/colors";

export function ColorPalette() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-heading">Color Palette</h2>

      {/* Main Colors */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Main Colors</h3>
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-lg border-2 border-gray-200"
              style={{ backgroundColor: colors.main }}
            ></div>
            <span className="text-sm mt-1">Main</span>
            <span className="text-xs text-gray-500">{colors.main}</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-lg border-2 border-gray-200"
              style={{ backgroundColor: colors.secondary }}
            ></div>
            <span className="text-sm mt-1">Secondary</span>
            <span className="text-xs text-gray-500">{colors.secondary}</span>
          </div>
        </div>
      </div>

      {/* Accent Colors */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Accent Colors</h3>
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-lg border-2 border-gray-200"
              style={{ backgroundColor: colors.accent1 }}
            ></div>
            <span className="text-sm mt-1">Accent 1</span>
            <span className="text-xs text-gray-500">{colors.accent1}</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-lg border-2 border-gray-200"
              style={{ backgroundColor: colors.accent2 }}
            ></div>
            <span className="text-sm mt-1">Accent 2</span>
            <span className="text-xs text-gray-500">{colors.accent2}</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-lg border-2 border-gray-200"
              style={{ backgroundColor: colors.accent3 }}
            ></div>
            <span className="text-sm mt-1">Accent 3</span>
            <span className="text-xs text-gray-500">{colors.accent3}</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-lg border-2 border-gray-200"
              style={{ backgroundColor: colors.accent4 }}
            ></div>
            <span className="text-sm mt-1">Accent 4</span>
            <span className="text-xs text-gray-500">{colors.accent4}</span>
          </div>
        </div>
      </div>

      {/* Brand Scale */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Brand Color Scale</h3>
        <div className="flex gap-2">
          {Object.entries(colors.brand).map(([key, value]) => (
            <div key={key} className="flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-lg border-2 border-gray-200"
                style={{ backgroundColor: value }}
              ></div>
              <span className="text-xs mt-1">{key}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
