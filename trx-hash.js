const axios = require("axios");
const FormData = require("form-data");
const solanaWeb3 = require("@solana/web3.js");
let issuenumberEntry = 2023030211394;
const getNum = async () => {
  const connection = new solanaWeb3.Connection(
    solanaWeb3.clusterApiUrl("mainnet-beta")
  );
  const blockHash = await connection.getLatestBlockhash();
  const res = blockHash.lastValidBlockHeight;
  console.log(`Block hash solana : ${res}`)
  return res.toString().at(res.toString().length - 1);
};
const getBalance = async () => {
  var formData = new FormData();
  formData.append("uid", 638248);
  formData.append(
    "sign",
    "21EE754BC66501934222C68FE0105806C3E71E04403B19DAB37E015C28BC2CD9"
  );
  formData.append("language", "vi");
  const result = await axios.post(
    `https://92lotteryapi.com/api/webapi/GetWinsUserAmount`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  console.log("Số tiền còn lại : " + result.data?.data?.Amount);
  // if (result.data?.data?.Amount < 50000) {
  //   process.exit(1);
  //   process.exit(0);
  // }
};
const predict = async () => {
  const number = await getNum();
  if (number > 4) {
    return "big";
  }
  return "small";
};
predict()

const betAction = async () => {
    const number = await predict();
    console.log('betAction',number)
    await bet(number);
}

const app = async () => {
  console.log(`Start ====`)
  await betAction();
  setInterval(async () => {
    console.log(`=================================`);
    console.log(`issuseNumber : ${issuenumberEntry}`)
    await betAction();
    console.log(`=================================`)
    issuenumberEntry +=1;
  },1000*66)
};



const bet = async (target) => {
  try {
    var formData = new FormData();
    formData.append("uid", 638248);
    formData.append(
      "sign",
      "21EE754BC66501934222C68FE0105806C3E71E04403B19DAB37E015C28BC2CD9"
    );
    formData.append("amount", 1000);
    formData.append("betcount", 5);
    formData.append("gametype", 2);
    formData.append("selecttype", target || 'big');
    formData.append("issuenumber", issuenumberEntry);
    formData.append("language", "vi");
    formData.append("typeid", 13);

    const result = await axios.post(
      "https://92lotteryapi.com/api/webapi/GameTRXBetting",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log(result.data?.msg);
    await getBalance();
    console.log(
      `${Date.now()} - Typeid ${13} - ${issuenumberEntry} - Đăt số ${target || 'big'}`
    );
  } catch (error) {
    console.log(error);
  }
};
app();
