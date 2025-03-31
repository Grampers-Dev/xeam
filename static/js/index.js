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

const toggleIcon = document.getElementById("theme-toggle");
toggleIcon.innerText = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";

toggleIcon.addEventListener("click", function () {
  const darkMode = document.body.classList.toggle("dark-mode");
  toggleIcon.innerText = darkMode ? "☀️" : "🌙";
  localStorage.setItem("theme", darkMode ? "dark" : "light");
});
