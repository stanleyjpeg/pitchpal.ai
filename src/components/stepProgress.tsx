import React from "react";

export default function StepProgress({ step }: { step: number }) {
  const steps = ["Paste Link", "Generate Pitch", "Customize", "Export"];

  return (
    <div className="flex justify-between items-center max-w-4xl mx-auto py-6 px-4">
      {steps.map((label, index) => (
        <div key={label} className="flex-1 text-center relative">
          <div
            className={`w-4 h-4 mx-auto rounded-full ${
              index <= step ? "bg-black" : "bg-gray-300"
            }`}
          />
          <p className="mt-2 text-sm text-gray-600">{label}</p>
          {index < steps.length - 1 && (
            <div
              className={`absolute top-2 left-1/2 w-full h-0.5 transform -translate-x-1/2 ${
                index < step ? "bg-black" : "bg-gray-300"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
