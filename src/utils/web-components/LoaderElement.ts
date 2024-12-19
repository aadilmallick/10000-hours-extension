import { BasicColorLogger } from "../assorted-vanillajs/logging";
import { css, CSSVariablesManager, DOM, html } from "../Dom";
import WebComponent from "./WebComponent";

interface Props {
  "data-num-bars"?: number;
  "data-color"?: string;
  "data-size"?: string;
}

type PropsArray = (keyof Props)[];

export class LoadingSpinner extends WebComponent<PropsArray> {
  static get CSSContent() {
    return css`
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .loader {
        /**
         * 
         * 
        --size: 2rem;
        --color: gray;
         */
        animation: spin 0.75s infinite steps(var(--count));

        height: var(--size);
        position: relative;
        width: var(--size);

        span {
          background: var(--color);
          height: 25%;
          left: 50%;
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%)
            rotate(calc(((360 / var(--count)) * var(--index)) * 1deg))
            translate(0, -125%);
          width: 10%;
          opacity: calc(var(--index) / var(--count));
        }
      }
    `;
  }

  static get HTMLContent() {
    return html`<div class="loader"></div>`;
  }

  private numBars: number;
  private rootElement: HTMLElement;
  private loaderVariablesManager: CSSVariablesManager<{
    count: number;
    size: `${number}rem`;
    color: string;
  }>;

  static registerSelf() {
    WebComponent.register("loading-spinner", LoadingSpinner);
  }

  static get observedAttributes() {
    return ["data-num-bars", "data-color", "data-size"] as PropsArray;
  }

  constructor() {
    super({
      templateId: "loading-spinner",
    });
  }

  configureSpinner({
    loaderColor,
    loaderSize,
    numBars,
  }: {
    numBars: number;
    loaderColor: string;
    loaderSize: string;
  }) {
    this.loaderVariablesManager = new CSSVariablesManager(this.rootElement, {
      color: loaderColor,
      size: loaderSize.endsWith("rem")
        ? (loaderSize as `${number}rem`)
        : `2rem`,
      count: numBars,
    });
  }

  connectedCallback(): void {
    super.connectedCallback();
    const numBars = Number(this.getObservableAttr("data-num-bars") || 10);
    this.numBars = numBars;
    const loaderColor = this.getObservableAttr("data-color");
    const loaderSize = this.getObservableAttr("data-size");
    this.rootElement = this.$(".loader") as HTMLElement;
    this.configureSpinner({
      numBars: this.numBars,
      loaderColor,
      loaderSize,
    });
    this.constructSpinner();
  }

  private constructSpinner() {
    this.destroySpinner();
    const spans = [] as string[];
    for (let i = 0; i < this.numBars; i++) {
      spans.push(`<span style="--index: ${i}"></span>\n`);
    }
    DOM.addElementsToContainer(
      this.rootElement,
      spans.map((span) => DOM.createDomElement(span))
    );
  }

  private destroySpinner() {
    this.rootElement.innerHTML = "";
  }

  attributeChangedCallback(
    attrName: "data-num-bars" | "data-color" | "data-size",
    oldVal: string,
    newVal: string
  ): void {
    if (!oldVal) return;
    if (attrName === "data-num-bars") {
      this.numBars = Number(newVal);
      this.constructSpinner();
      this.loaderVariablesManager.set("count", this.numBars);
    }
    if (attrName === "data-color") {
      this.loaderVariablesManager.set("color", newVal);
    }
    if (attrName === "data-size") {
      this.loaderVariablesManager.set(
        "size",
        newVal.endsWith("rem") ? (newVal as `${number}rem`) : `2rem`
      );
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "loading-spinner": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & Props,
        HTMLElement
      >;
    }
  }
}
