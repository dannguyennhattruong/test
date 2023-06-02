const axios = require("axios");
let heso = 1;
let currentBalance = 0;
let forceHeso = undefined;
let accToken = require("./accToken.json").accToken;
let rf = require("./accToken.json").rf;
const fs = require("fs");

const getToken = async () => {
  try {
    const result = await axios({
      method: "post",
      url: "https://fastfi.pro/api/auth/auth/token?refresh=1",
      data: {
        client_id: "raidenbo-web",
        grant_type: "refresh_token",
        captcha: "string",
        captcha_geetest: {
          captcha_output: "",
          gen_time: "",
          lot_number: "",
          pass_token: "",
        },
        refresh_token: rf,
      },
    });
    accToken = result.data?.d?.access_token;
    rf = result?.data?.d?.refresh_token;
    const obj = {
      accToken,
      rf,
    };
    fs.writeFile("./accToken.json", JSON.stringify(obj), function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    });
  } catch (error) {
    forceHeso = heso;
    console.log(error.message);
  }
};
function generateOTP() {
  // Declare a digits variable
  // which stores all digits
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 5; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  console.log(`OTP : ${OTP}`);
  return OTP.at(-1);
}

const predict = () => {
  const random = Number(generateOTP());
  // // console.log(random);
  if (random > 4) {
    return "UP";
  }
  return "DOWN";
};

const getBalance = async () => {
  try {
    const result = await axios({
      method: "get",
      url: "https://fastfi.pro/api/wallet/binaryoption/spot-balance",
      headers: {
        Authorization: "Bearer " + accToken,
      },
    });
    console.log("Số tiền hiện tại : " + result.data?.d?.availableBalance + "$");
    sendMsg(
      `🔥 Số dư hiện tại ${
        result.data?.d?.availableBalance
      } ~ ${convertUsdtoVND(result.data?.d?.availableBalance * 23500)}`
    );
    // if (result.data?.d?.availableBalance >= 177) {
    //   process.exit(0);
    // }

    return result.data?.d?.availableBalance || (await getBalance());
  } catch (error) {
    forceHeso = heso;
    console.log(error.message);
    await getToken();
    return await getBalance();
  }
};
let paid = true;
const main = async (num) => {
  console.log(`chojn ${num}`);
  console.log(`===========X============`);
  try {
    console.log(` Số tiền đặt cược là ${1 * heso} `);

    const result = await axios({
      method: "post",
      url: "https://fastfi.pro/api/wallet/binaryoption/bet",
      data: {
        betType: `${num}`,
        betAmount: Number(`${1 * heso}`),
        betAccountType: "LIVE",
      },
      headers: {
        authorization: "Bearer " + accToken,
      },
    });
    console.log(result.data?.ok);
    paid = result.data?.ok;
    console.log(`=================================`);
  } catch (error) {
    console.log(error.message);
    paid = false;
    await getToken();
    await main(num);
  }
};

let interval;

const app = async () => {
  getBalance().then((r) => {
    if (r) {
      currentBalance = r;
      sendMsg(`>>> Số dư hiện tại : ${r} ~ ${convertUsdtoVND(r * 23500)}`);
    }
    interval = setInterval(() => {
      getBalance().then((b) => {
        console.log(`CurrentBalance : ${currentBalance}`);
        console.log(`BalanceAfter : ${b}`);
        if (b < currentBalance) {
          heso *= 2;
          if (heso > 32) {
            heso = 1;
          }
        } else {
          if (paid) {
            heso = 1;
          }
        }
        if (paid && b) {
          currentBalance = b;
        }

        if (currentBalance >= 76) {
          sendMsg(`Đạt target >> dừng lệnh`)
          clearInterval(interval);
        }
        sendMsg(`💎 FastFi`).then((_) => {
          sendMsg(`🍀 Vốn : 61$ ~ ${convertUsdtoVND(61 * 23500)}`).then(
            (__) => {
              sendMsg(
                `🔥 Số dư hiện tại ${currentBalance} ~ ${convertUsdtoVND(
                  currentBalance * 23500
                )}`
              ).then((___) => {
                sendMsg(
                  `🚀 Biến động : ${currentBalance > 61 ? "+" : "-"} ${Number(
                    (Math.abs(61 - currentBalance) / 61) * 100
                  ).toFixed(2)} %`
                ).then((____) => {
                  sendMsg(`<==============================>`);
                });
              });
            }
          );
        });

        main(predict());
      });
    }, 1000 * 60);
  });
};
const convertUsdtoVND = (number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    number
  );

// const sendToTelegram2 = async (balance) => {
//   var message = `
//                     💎 FastFi===================

//                       \n===================

//                     🔥 Số dư hiện tại ${balance} ~ ${convertUsdtoVND(
//     balance * 23500
//   )} \n===================

//                     🚀 Biến động : ${balance > 100 ? "+" : "-"} ${Number(
//     (Math.abs(100 - balance) / 100) * 100
//   ).toFixed(2)} %

//     `;

//   var token = "6117786373:AAEOHcV7CGsdh8pJG08Genbth-5E53X6mGs";
//   var chat_id = -937363962;
//   var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${message}`; //&parse_mode=html

//   try {
//     const res = await axios.get(url);
//   } catch (e) {}
//   // if (balance >= 500000 + 100000) {
//   //   process.exit(0);
//   // }

//   // if (balance < 450000) {
//   //   process.exit(0);
//   // }
// };

const sendMsg = async (msg) => {
  var token = "6117786373:AAEOHcV7CGsdh8pJG08Genbth-5E53X6mGs";
  var chat_id = -937363962;
  var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${msg}`; //&parse_mode=html

  try {
    const res = await axios.get(url);
  } catch (e) {}
};

const setupTelebotCommand = async () => {
  const { Telegraf } = require("telegraf");
  const exec = require("child_process").exec;

  const bot = new Telegraf("6117786373:AAEOHcV7CGsdh8pJG08Genbth-5E53X6mGs");
  bot.hears("hi", (ctx) => ctx.reply("Hey there"));
  bot.command("stop1", (ctx) => {
    clearInterval(interval);
    console.log("Bạn đã dừng lệnh. Số tiền hiện tại là : " + currentBalance);
    ctx.reply("Bạn đã dừng lệnh. Số tiền hiện tại là : " + currentBalance);
    const msg = "Bạn đã dừng lệnh. Số tiền hiện tại là : " + currentBalance;
    var token = "6117786373:AAEOHcV7CGsdh8pJG08Genbth-5E53X6mGs";
    var chat_id = -937363962;
    var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${msg}`; //&parse_mode=html

    axios.get(url).then((r) => {});
  });
  sendMsg(`>>>> /run là bắt đầu chạy`);
  sendMsg(`>>>> /stop1 là dừng`);
  bot.command("run", (ctx) => {
    app();
  });
  bot.launch();
};

app();
main(predict());

setupTelebotCommand();
