// type Action<T extends {action: infer ActionType extends string}> = T extends

// const port = chrome.runtime.connect({ name: "knockknock" });
// chrome.runtime.onConnect.addListener((port) => {
//   if (port.name === "knockknock") {
//     console.log("hello");
//   }
// });

class PortConnection {
  port: chrome.runtime.Port;
  constructor(public readonly name: string) {
    this.port = chrome.runtime.connect({ name: name });
  }

  onPortConnect(cb: (port: chrome.runtime.Port, msg: any) => void) {
    this.port.onMessage.addListener((msg) => {
      cb(this.port, msg);
    });
  }

  onConnect(cb: (port: chrome.runtime.Port, msg: any) => void) {
    chrome.runtime.onConnect.addListener((port) => {
      if (port.name === this.name) {
        port.onMessage.addListener((msg) => {
          cb(port, msg);
        });
      }
    });
  }
}
