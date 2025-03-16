// index.js
import { MetaMaskSDK } from "@metamask/sdk"

const MMSDK = new MetaMaskSDK({
  dappMetadata: {
    name: "Example Node.js Dapp",
  },
  infuraAPIKey: "7494b0df618d4ff6b3152f12c14ba456",
  // Other options.
})

const accounts = await MMSDK.connect()
const provider = MMSDK.getProvider()
provider.request({ method: "eth_accounts", params: [] })