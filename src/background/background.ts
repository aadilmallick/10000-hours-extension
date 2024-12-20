import { Runtime } from "../chrome-api/runtime";
import { appStorage } from "./controllers/storage";

Runtime.onInstall({
  onAll: async () => {
    await appStorage.setup()
    console.log(await appStorage.get("journies"))
  },
});
