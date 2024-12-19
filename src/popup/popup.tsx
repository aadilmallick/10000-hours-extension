import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import "./popup.css";
import Toaster from "../utils/web-components/Toaster";
import IconButton from "@/custom/IconButton";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "../utils/web-components/LoaderElement";
import { PageLoaderElement } from "../utils/web-components/PageLoaderElement";

Toaster.registerSelf();
LoadingSpinner.registerSelf();
PageLoaderElement.registerSelf();

// declare global {
//   namespace JSX {
//     interface IntrinsicElements {
//       "toaster-element": React.DetailedHTMLProps<
//         React.HTMLAttributes<HTMLElement>,
//         HTMLElement
//       >;
//     }
//   }
// }

const App: React.FC<{}> = () => {
  const toasterRef = React.useRef<Toaster>(null);

  return (
    <div>
      <p className="text-white text-2xl underline font-black">Hello world</p>
      <Button variant="outline" className="bg-white text-black">
        Hello
      </Button>
      <button
        className="bg-white px-3 py-1 rounded"
        onClick={() => {
          toasterRef.current?.toast("Hello world");
          // Toaster.toast("Hello world");
        }}
      >
        Toast
      </button>
      {/* this is how you refer to assets: they live in the static folder, and you refer to them
      absolutely. */}
      <toaster-element
        data-position="bottom-right"
        ref={toasterRef}
      ></toaster-element>
      <div>
        <loading-spinner
          data-num-bars={5}
          data-color="red"
          data-size="2rem"
        ></loading-spinner>
      </div>
      <page-loader
        data-size="3rem"
        data-loader-background="#266"
        data-color="blue"
        data-animation-speed-seconds={0.75}
        data-fade-out-time={4000}
      ></page-loader>
    </div>
  );
};

const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container);
root.render(<App />);
