const ethers = require("ethers");
(async () => {
  const provider = new ethers.providers.JsonRpcProvider(`https://bsc-dataseed1.binance.org/`);
  const blockNum = await provider.getBlockNumber();
  console.log(blockNum);
})();