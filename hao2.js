const axios = require("axios");
const FormData = require("form-data");
let heso = 3;
let currentBalance = 0;
let currentOTP = 0;
let betAmount = 0;
let interval = 0;
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
  return OTP.at(-1);
}

const predict = () => {
  const random = Number(generateOTP());
  // // console.log(random);
  if (random > 4) {
    return "big";
  }
  return "small";
};

const getBalance = async () => {
  var formData = new FormData();
  formData.append("uid", 1006536);
  formData.append(
    "sign",
    "BA3FC1B9C040DD0BD675380A548C7FA9FABBE6249036C4002503F5910FCB5924"
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
};

let issuenumberEntry = 20230516130044;
const main = async (issueNum, num) => {
  console.log(` Phiên ${issuenumberEntry} ===========X============`);
  try {
    var formData = new FormData();
    formData.append("uid", 1006536);
    formData.append(
      "sign",
      "BA3FC1B9C040DD0BD675380A548C7FA9FABBE6249036C4002503F5910FCB5924"
    );
    formData.append("amount", `1000`);
    formData.append("betcount", `${heso}`);
    formData.append("gametype", "2");
    formData.append("selecttype", num || "small");
    formData.append("issuenumber", issueNum);
    formData.append("language", "vi");
    formData.append("typeid", 13);
    console.log(` Số tiền đặt cược là ${1000 * heso} `);
    betAmount = 1000 * heso;

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

    console.log(
      `${Date.now()} - Typeid ${1} - ${issueNum} - Đăt số ${num || "small"}`
    );
    console.log(
      `=====================================================================`
    );
  } catch (error) {
    console.log(error);
  }
};
main(issuenumberEntry, predict());
let count = 1;
getBalance().then((r) => {
  currentBalance = r;
  interval = setInterval(() => {
    issuenumberEntry = issuenumberEntry + 2;
    console.log(`Count ${count}`);
    if (count > 10) {
      count = 1;
    } else {
      console.log(issuenumberEntry.toString().slice());
      console.log("go - " + issuenumberEntry);
      getBalance().then((b) => {
        console.log(
          `CurrentBalance : ${currentBalance} ~ ${Number(
            currentBalance / 23500
          ).toFixed(2)}$`
        );
        console.log(`BalanceAfter : ${b} ~ ${Number(b / 23500).toFixed(2)}$`);
        let txt = "win";
        if (b < currentBalance) {
          txt = "lose";
          heso *= 2;
        } else {
          heso = 3;
        }
        currentBalance = b;
        sendToTelegram2(currentBalance, issuenumberEntry, txt);
        const OTP = predict();

        main(issuenumberEntry, OTP);
        count++;
        console.log(`Count+ 1 ${1}`);
      });
    }
  }, 1000 * 120);
});

const sendToTelegram = async (balance, phien, OTP) => {
  var message = ` <h1>Phiên : </h1>${phien} <br>
                  Số dư hiện tại ${balance} <br>
                  Chọn : ${OTP} <br>
                  Đã cược : ${betAmount} <br>
  `;

  var token = "6130196665:AAGrGQOsiu7VJ4wWjxABQlOYCLjYsTpMQJM";
  var chat_id = -1001932745783;
  var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${message}&parse_mode=html`; //&parse_mode=html

  try {
    const res = await axios.get(url);
  }
  catch(e) {

  }
};

const sendToTelegram2 = async (balance, phien, txt) => {
  var message = `
                  🍀 Vốn : 1.000.000 \n

                  🔥 Số dư hiện tại ${balance} \n

                  🚀 Biến động : ${balance > 1000000 ? "+" : "-"} ${Number(
    (Math.abs(1000000 - balance) / 1000000) * 100
  ).toFixed(2)} %

  `;

  var token = "6130196665:AAGrGQOsiu7VJ4wWjxABQlOYCLjYsTpMQJM";
  var chat_id = -1001932745783;
  var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${message}&parse_mode=html`; //&parse_mode=html

  try {
    const res = await axios.get(url);
  }
  catch(e) {

  }
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

  const bot = new Telegraf("6130196665:AAGrGQOsiu7VJ4wWjxABQlOYCLjYsTpMQJM");
  bot.hears("hi", (ctx) => ctx.reply("Hey there"));
  bot.command("stop1", (ctx) => {
    clearInterval(interval);
    console.log("Bạn đã dừng lệnh. Số tiền hiện tại là : " + currentBalance);
    ctx.reply("Bạn đã dừng lệnh. Số tiền hiện tại là : " + currentBalance);
    const msg = "Bạn đã dừng lệnh. Số tiền hiện tại là : " + currentBalance;
    var token = "6130196665:AAGrGQOsiu7VJ4wWjxABQlOYCLjYsTpMQJM";
    var chat_id = -1001932745783;
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

// Hao

//https://cerise-tadpole-tutu.cyclic.app/createTeleBot/test2/6130196665:AAGrGQOsiu7VJ4wWjxABQlOYCLjYsTpMQJM/-1001932745783/1006536/BA3FC1B9C040DD0BD675380A548C7FA9FABBE6249036C4002503F5910FCB5924/3/120
//
