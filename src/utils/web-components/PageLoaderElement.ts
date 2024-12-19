import { BasicColorLogger } from "../assorted-vanillajs/logging";
import { css, CSSVariablesManager, DOM, html } from "../Dom";
import WebComponent from "./WebComponent";

interface Props {
  "data-size"?: `${number}rem`;
  "data-color"?: string;
  "data-animation-speed-seconds"?: number;
  "data-loader-background"?: string;
}

interface StaticProps {
  "data-fade-out-time"?: number;
}

const defaults: Props = {
  "data-size": "4rem",
  "data-color": "orange",
  "data-animation-speed-seconds": 1.5,
  "data-loader-background": "#222",
};
type PropsArray = (keyof Props)[];
const observableAttributes = Object.keys(defaults) as PropsArray;
const tagName = "page-loader";

export class PageLoaderElement extends WebComponent<PropsArray> {
  /**
   * Scoped shadow-DOM CSS styling for element
   */
  static override get CSSContent() {
    return css`
      .loader-container {
        position: fixed;
        inset: 0;
        background-color: var(--loader-background);
        display: grid;
        place-content: center;
        z-index: 9000;
      }

      .loader {
        /* creates spinner */
        height: var(--size);
        width: var(--size);
        border-radius: 9999px;
        border: rgba(255, 255, 255, 0.3) solid 0.25rem;
        position: relative;
        z-index: 1;
        animation: loader var(--time) infinite linear;
        &::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border-left: var(--color) solid 0.25rem;
          animation: loader var(--time) infinite linear;
          z-index: 2;
        }
      }

      @keyframes loader {
        0% {
          transform: rotate(0deg) scale(1);
        }
        50% {
          transform: rotate(180deg) scale(1.2);
        }
        to {
          transform: rotate(360deg) scale(1);
        }
      }
    `;
  }

  /**
   * HTML content for element
   */
  static override get HTMLContent() {
    return html` <div class="loader-container">
      <div class="loader"></div>
    </div>`;
  }

  /**
   * Register element to custom elements
   */
  static registerSelf() {
    WebComponent.register(tagName, PageLoaderElement);
  }

  private fadeOutTime?: number;

  /**
   * !SUPPPER IMPORTANT
   * YOU CAN only access this.dataset in constructor, not any attributes.
   */
  constructor() {
    super({
      templateId: tagName,
    });
  }

  private rootElement: HTMLElement | null = null;
  private pageLoaderVariablesManager: CSSVariablesManager<{
    size: `${number}rem`;
    color: string;
    time: `${number}s`;
    "loader-background": string;
  }> | null = null;
  /**
   * Deal with DOM insertions and querying here
   * when element first gets added to DOM
   */
  override connectedCallback(): void {
    super.connectedCallback();
    this.rootElement = this.$(".loader-container") as HTMLElement;
    this.fadeOutTime = Math.max(
      0,
      Number(this.getAttribute("data-fade-out-time"))
    );
    BasicColorLogger.info(`fade out time: ${this.fadeOutTime}`);

    this.pageLoaderVariablesManager = new CSSVariablesManager(
      this.rootElement,
      {
        color: defaults["data-color"],
        size: defaults["data-size"],
        time: `${defaults["data-animation-speed-seconds"]}s`,
        "loader-background": defaults["data-loader-background"],
      }
    );
    this.setObservedAttributes();

    if (this.fadeOutTime) {
      setTimeout(() => {
        console.log("fading out");
        this.fadeOut();
      }, this.fadeOutTime);
    }
  }

  private setObservedAttributes() {
    observableAttributes.forEach((attr) => {
      const value = this.getObservableAttr(attr);
      if (!value) return;
      switch (attr) {
        case "data-size":
          this.pageLoaderVariablesManager.set("size", value as `${number}rem`);
          break;
        case "data-color":
          this.pageLoaderVariablesManager.set(
            "color",
            value || defaults["data-color"]
          );
          break;
        case "data-animation-speed-seconds":
          this.pageLoaderVariablesManager.set("time", `${Number(value)}s`);
          break;
        case "data-loader-background":
          this.pageLoaderVariablesManager.set(
            "loader-background",
            value || defaults["data-loader-background"]
          );
          break;
        default:
          break;
      }
    });
  }

  fadeOut() {
    const animation = this.rootElement.animate([{ opacity: 0 }], {
      duration: 1000,
    });
    // wait for animation to finish
    animation.onfinish = () => {
      this.remove();
    };
  }

  /**
   * Essential getter to listen to changes on
   * the special observed attributes.
   */
  static override get observedAttributes() {
    return observableAttributes;
  }

  /**
   *
   * Deal with any observable attribute changes here
   */
  override attributeChangedCallback(
    attrName: keyof Props,
    oldVal: string,
    newVal: string
  ): void {
    this.pageLoaderVariablesManager && this.setObservedAttributes();
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [tagName]: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & Props & StaticProps,
        HTMLElement
      >;
    }
  }
}
