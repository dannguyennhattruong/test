const axios = require("axios");
let heso = 1.6;
let hesoD = 1.6;
let currentBalance = 0;
let forceHeso = undefined;
let accToken = require("./accToken2.json").accToken;
let rf = require("./accToken2.json").rf;
const fs = require("fs");
let isStop = false;
let betCount = 0;
let fixedBalance = 0;
let betIndex = 0;
let a = [
  "UP",
  "UP",
  "UP",
  "UP",
  "DOWN",
  "DOWN",
  "UP",
  "DOWN",
  "DOWN",
  "DOWN",
  "DOWN",
  "UP",
  "UP",
].reverse();

const getToken = async () => {
  try {
    const result = await axios({
      method: "post",
      url: "https://skbit5.net/api/auth/auth/token?refresh=1",
      data: {
        client_id: "kitanex-web",
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
    fs.writeFile(
      "./accToken_cronbase.json",
      JSON.stringify(obj),
      function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      }
    );
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

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

const predict = () => {
  const random = Number(generateOTP());
  // // console.log(random);
  // const d = Date.now();
  // const random = Number(d.toString()[d.toString().length - 1]);
  if (random > 4) {
    return "UP";
  }
  return "DOWN";
};

const getBalance = async () => {
  try {
    const result = await axios({
      method: "get",
      url: "https://skbit5.net/api/wallet/binaryoption/spot-balance",
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
    sendMsg(` Số tiền đặt cược là ${1 * heso} `);
    sendMsg(`Đặt ${num}`);
    const result = await axios({
      method: "post",
      url: "https://skbit5.net/api/wallet/binaryoption/bet",
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

const getMin = () => {
  const d = new Date();
  let minutes = d.getMinutes();
  return minutes;
};

let interval;
let von = 50;
fixedBalance = von;
let x = 2;
let y = 0;
let target = 5;
let forceStop = false;
let loseCount = 0;
let choose = 0;
let step = 0;
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
        if (!forceStop) {
          if (!isStop) {
            if (b < currentBalance) {
              betIndex++;
              loseCount += 1;
              heso *= 2;
            } else {
              loseCount = 0;
              betIndex++;
              heso = hesoD;
            }
            if (paid && b) {
              currentBalance = b;
            }
            console.log("fixedBalance", fixedBalance);
            console.log("currentBalance", currentBalance);
            console.log("r", currentBalance - fixedBalance);

            // if (currentBalance - fixedBalance <= -12) {
            //   sendMsg(` Stop lost -12$ , số dư hiện tại : $` + currentBalance);
            //   process.exit(1);
            // }
            console.log(`lose count`, loseCount);
            if (loseCount >= 4) {
              sendMsg(
                ` Bị thua lần thứ ${loseCount} : $` +
                  currentBalance +
                  ` . /run để bắt đầu lại`
              );
              loseCount = 0;
              heso = hesoD;
              fixedBalance = currentBalance;
              isStop = true;

              forceStop = true;
            }

            if (currentBalance - fixedBalance >= 3) {
              fixedBalance = currentBalance;
              isStop = true;
              forceStop = true;
              sendMsg(
                " ✅ Hoàn thành mục tiêu đạt 3$, số tiền hiện tại là : $" +
                  currentBalance
              );
            }

            // stop lost
            // if (currentBalance <= 100.95) {
            //   process.exit(1);
            // }

            //take profit
            // if (currentBalance >= 70) {
            //   isStop = true;
            //   sendMsg(
            //     " ✅ Hoàn thành mục tiêu đạt 71.03$, số tiền hiện tại là : $" +
            //       currentBalance
            //   ).then((_) => {
            //     process.exit(1);
            //   });
            // }

            // const five_percent = von * 2 + von;
            // console.log(`Target ${five_percent}`);

            // if (currentBalance >= 106) {
            //   // sendMsg(`Đạt target >> dừng lệnh`);
            //   clearInterval(interval);
            //   process.exit(1);
            // }
            sendMsg(`💎 FastFi`).then((_) => {
              sendMsg(
                `🍀 Vốn : ${von}$ ~ ${convertUsdtoVND(von * 23500)}`
              ).then((__) => {
                sendMsg(
                  `🔥 Số dư hiện tại ${currentBalance} ~ ${convertUsdtoVND(
                    currentBalance * 23500
                  )}`
                ).then((___) => {
                  sendMsg(
                    `🚀 Biến động : ${
                      currentBalance > von ? "+" : "-"
                    } ${Number(
                      (Math.abs(von - currentBalance) / von) * 100
                    ).toFixed(2)} %`
                  ).then((____) => {
                    sendMsg(`<==============================>`);
                  });
                });
              });
            });
            if (!isStop) {
              // step++;
              // let c = choose === 0 ? "UP" : "DOWN";
              // console.log("step: " + step);
              // if (step > 2) {
              //   step = 0;
              // } else {
              //   if (choose === 0) {
              //     choose = 1;
              //   } else {
              //     choose = 0;
              //   }
              // }
              if (!a[betIndex]) {
                betIndex = 0;
              }
              main(predict());
            }
          } else {
            betCount++;
            if (betCount >= x) {
              x = getRandomArbitrary(1, 2);
              console.log("Bỏ " + x + " lượt");
              betCount = 0;
              isStop = false;
            }
          }
        }
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

//   var token = "5684927288:AAHqkWbD7dCxG6ChFZYC4p8ZP8AL5no_H9M";
//   var chat_id = -1001932745783;
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
  var token = "5684927288:AAHqkWbD7dCxG6ChFZYC4p8ZP8AL5no_H9M";
  var chat_id = -861626613;
  var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${msg}`; //&parse_mode=html

  try {
    const res = await axios.get(url);
  } catch (e) {}
};

const setupTelebotCommand = async () => {
  const { Telegraf } = require("telegraf");
  const exec = require("child_process").exec;

  const bot = new Telegraf("5684927288:AAHqkWbD7dCxG6ChFZYC4p8ZP8AL5no_H9M");
  bot.hears("hi", (ctx) => ctx.reply("Hey there"));
  bot.command("stop1", (ctx) => {
    // clearInterval(interval);
    console.log("Bạn đã dừng lệnh. Số tiền hiện tại là : " + currentBalance);
    ctx.reply("Bạn đã dừng lệnh. Số tiền hiện tại là : " + currentBalance);
    const msg = "Bạn đã dừng lệnh. Số tiền hiện tại là : " + currentBalance;
    var token = "5684927288:AAHqkWbD7dCxG6ChFZYC4p8ZP8AL5no_H9M";
    var chat_id = -1001932745783;
    var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${msg}`; //&parse_mode=html

    axios.get(url).then((r) => {
      // process.exit(1);
      sendMsg("Force stop");
      forceStop = true;
    });
  });
  sendMsg(`>>>> /run là bắt đầu chạy`);
  sendMsg(`>>>> /stop1 là dừng`);
  bot.command("run", (ctx) => {
    hesoD = 1.7;
    forceStop = false;
    sendMsg("Starting ...");
  });
  bot.launch();
};

app();
main(predict());

setupTelebotCommand();

// sendMsg(`Đạt target 5% >> dừng lệnh`).then((_) => {
//   sendMsg(`Số tiền đạt được $140.8615`).then((__) => {
//     clearInterval(interval);
//     process.exit(1);
//   });
// });
