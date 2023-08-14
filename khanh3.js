const axios = require("axios");
const FormData = require("form-data");
let heso = 3;
let currentBalance = 0;
let currentOTP = 0;
let betAmount = 0;
let interval = 0;
let flag = true;
let changeType = 0;
function generateOTP() {
  // Declare a digits variable
  // which stores all digits
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 5; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  console.log(`OTP : ${OTP}`);
  currentOTP = OTP;
  return OTP[OTP.length - 1];
}

const predict = () => {
  const random = Number(generateOTP());
  // // console.log(random);
  if (random > 4) {
    return "big";
  }
  return "small";
};

const getGameIssuse = async () => {
  try {
    const formData = new FormData();
    formData.append("language", "vi");
    if (changeType === 0) {
      formData.append("typeid", "13");
    } else {
      formData.append("typeid", "1");
    }
    const gameIssuse = await axios.post(
      changeType === 0
        ? "https://92lotteryapi.com/api/webapi/GetTRXGameIssue"
        : `https://92lotteryapi.com/api/webapi/GetGameIssue`,
      formData
    );

    return gameIssuse.data?.data?.IssueNumber;
  } catch (error) {
    return await getGameIssuse();
  }
};

const getBalance = async () => {
  try {
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
    console.log(
      "Số tiền hiện tại : " +
        result.data?.data?.Amount +
        " " +
        `~ ${Number(result.data?.data?.Amount / 23500).toFixed(2)}$`
    );
    return result.data?.data?.Amount;
  } catch (error) {
    return await getBalance();
  }
};

let issuenumberEntry = 20230531130749;
const main = async (issueNum, num) => {
  const iss = await getGameIssuse();
  console.log(` Phiên ${iss} ===========X============`);
  try {
    const formData = new FormData();
    formData.append("uid", 638248);
    formData.append(
      "sign",
      "21EE754BC66501934222C68FE0105806C3E71E04403B19DAB37E015C28BC2CD9"
    );
    formData.append("amount", `1000`);
    formData.append("betcount", `${heso}`);
    formData.append("gametype", "2");
    formData.append("selecttype", num || "small");
    formData.append("issuenumber", iss);
    formData.append("language", "vi");
    if (changeType === 0) {
      formData.append("typeid", 13);
    } else {
      formData.append("typeid", 1);
    }
    console.log(` Số tiền đặt cược là ${1000 * heso} `);
    betAmount = 1000 * heso;

    const result = await axios.post(
      changeType === 0
        ? "https://92lotteryapi.com/api/webapi/GameTRXBetting"
        : "https://92lotteryapi.com/api/webapi/GameBetting",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log(result.data?.msg);
    console.log(
      `${Date.now()} - Typeid ${1} - ${iss} - Đăt số ${num || "small"}`
    );
    console.log(
      `=====================================================================`
    );
  } catch (error) {
    console.log(error);
    return await main(issueNum, num);
  }
};
main(issuenumberEntry, predict());

let forceStop = false;
let x = 2;
let von = 1000000;
let fixedBalance = von;
let betCount =0;
getBalance().then((r) => {
  currentBalance = r;
  interval = setInterval(() => {
    issuenumberEntry = issuenumberEntry + 1;
    console.log(issuenumberEntry.toString().slice());
    console.log("go - " + issuenumberEntry);
    getBalance().then((b) => {
      console.log(
        `CurrentBalance : ${currentBalance} ~ ${Number(
          currentBalance / 23500
        ).toFixed(2)}$`
      );
      if (!forceStop) {
        console.log(`BalanceAfter : ${b} ~ ${Number(b / 23500).toFixed(2)}$`);
        let txt = "win";
        if (b < currentBalance) {
          txt = "lose";
          heso *= 2;
          heso = heso + 1;
          sendMsg(`LOSE`);
        } else {
          heso = 3;
          sendMsg(`WIN`);
          // if (changeType === 0) {
          //   changeType = 1;
          //   sendMsg(`Chọn Wingo 🙂`);
          // } else {
          //   changeType = 0;
          //   sendMsg(`Chọn TRX 😎`);
          // }
        }
        sendMsg(`💎 92Lot`).then((_) => {
          sendMsg(`🍀 Vốn : ${convertUsdtoVND(von)}`).then((__) => {
            sendMsg(
              `🔥 Số dư hiện tại  ${convertUsdtoVND(currentBalance)}`
            ).then((___) => {
              sendMsg(
                `🚀 Biến động : ${currentBalance > von ? "+" : "-"} ${Number(
                  (Math.abs(von - currentBalance) / von) * 100
                ).toFixed(2)} %`
              ).then((____) => {
                sendMsg(`<==============================>`);
              });
            });
          });
        });
        console.log(`* ${b}`);

        if (currentBalance - fixedBalance >= 10000) {
          fixedBalance = currentBalance;
          forceStop = true;
          sendMsg(
            " ✅ Hoàn thành mục tiêu đạt 10000, số tiền hiện tại là : $" +
              currentBalance
          );
        }
        if (b) {
          currentBalance = b;

          // if (currentBalance >= 700000) {
          //   process.exit(1);
          // }
          // sendToTelegram2(currentBalance, issuenumberEntry, txt);
          const OTP = predict();
          main(issuenumberEntry, OTP);
        }
      } else {

        betCount++;
        if (betCount >= x) {
          x = getRandomArbitrary(1, 5);
          console.log("Bỏ " + x + " lượt");
          betCount = 0;
          forceStop = false;
        }
      }
    });
  }, 1000 * 60);
});

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}


const sendMsg = async (msg) => {
  var token = "6117786373:AAEOHcV7CGsdh8pJG08Genbth-5E53X6mGs";
  var chat_id = -937363962;
  var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${msg}`; //&parse_mode=html

  try {
    const res = await axios.get(url);
  } catch (e) {}
};

const convertUsdtoVND = (number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    number
  );

function generateRandom(min = 0, max = 9) {
  // find diff
  let difference = max - min;

  // generate random number
  let rand = Math.random();

  // multiply with difference
  rand = Math.floor(rand * difference);

  // add with min value
  rand = rand + min;

  return rand;
}

const get3Num = () => {
  let d = [];
  const n1 = generateRandom();
  d.push(n1);

  let getOtherNum = () => {
    var r = generateRandom();
    if (d.includes(r)) {
      return getOtherNum();
    }
    return r;
  };
  const n2 = getOtherNum();
  d.push(n2);

  const n3 = getOtherNum();
  d.push(n3);
  console.log(d);
  return d.map((m) => `${m}`);
};

const sendToTelegram = async (balance, phien, OTP) => {
  var message = ` <h1>Phiên : </h1>${phien} <br>
                    Số dư hiện tại ${balance} <br>
                    Chọn : ${OTP} <br>
                    Đã cược : ${betAmount} <br>
    `;

  var token = "6117786373:AAEOHcV7CGsdh8pJG08Genbth-5E53X6mGs";
  var chat_id = -1001886912905;
  var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${message}&parse_mode=html`; //&parse_mode=html

  const res = await axios.get(url);
};

const sendToTelegram2 = async (balance, phien, txt) => {
  var message = `
                    🍀 Vốn : 500.000  \n

                    🔥 Số dư hiện tại ${balance} \n

                    🚀 Biến động : ${balance > 500000 ? "+" : "-"} ${Number(
    (Math.abs(500000 - balance) / 500000) * 100
  ).toFixed(2)} %

    `;

  var token = "6117786373:AAEOHcV7CGsdh8pJG08Genbth-5E53X6mGs";
  var chat_id = -937363962;
  var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${message}`; //&parse_mode=html

  try {
    const res = await axios.get(url);
  } catch (e) {}
  // if (balance >= 500000 + 100000) {
  //   process.exit(0);
  // }

  // if (balance < 450000) {
  //   process.exit(0);
  // }
};

const setupTelebotCommand = async () => {
  const { Telegraf } = require("telegraf");
  const exec = require("child_process").exec;

  const bot = new Telegraf("6117786373:AAEOHcV7CGsdh8pJG08Genbth-5E53X6mGs");
  bot.hears("hi", (ctx) => ctx.reply("Hey there"));
  bot.command("stop", (ctx) => {
    clearInterval(interval);
    console.log("Bạn đã dừng lệnh. Số tiền hiện tại là : " + currentBalance);
    ctx.reply("Bạn đã dừng lệnh. Số tiền hiện tại là : " + currentBalance);
    const msg = "Bạn đã dừng lệnh. Số tiền hiện tại là : " + currentBalance;
    var token = "6117786373:AAEOHcV7CGsdh8pJG08Genbth-5E53X6mGs";
    var chat_id = -937363962;
    var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${msg}`; //&parse_mode=html

    axios.get(url).then((r) => {
      process.exit(0);
    });
  });

  // bot.command("run", (ctx) => {
  //   exec("node wingo", function (error, stdout, stderr) {
  //     console.log("stdout: " + stdout);
  //     console.log("stderr: " + stderr);
  //     if (error !== null) {
  //       console.log("exec error: " + error);
  //     }
  //   });
  // });
  bot.launch();
};

setupTelebotCommand();

//khanh
//https://cerise-tadpole-tutu.cyclic.app/createTeleBot/test/6117786373:AAEOHcV7CGsdh8pJG08Genbth-5E53X6mGs/-937363962/1005280/42BBBB760E868AFACF71C158B55438B8529C196E23BAA768CF0A4AB5A16BB812/3/120

//Minh
//https://cerise-tadpole-tutu.cyclic.app/createTeleBot/test2/6173439504:AAGO2UC3DI_wxvt6CGDJqV_pIEqiFLdGpOs/-1001886912905/1005280/42BBBB760E868AFACF71C158B55438B8529C196E23BAA768CF0A4AB5A16BB812/3/120
