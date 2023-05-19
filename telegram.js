const axios = require("axios");
const FormData = require("form-data");
const { Telegraf } = require("telegraf");

const sendToTelegram = async (balance, phien) => {
  var message = "hello";

  var token = "6130196665:AAGrGQOsiu7VJ4wWjxABQlOYCLjYsTpMQJM";
  var chat_id = -1001932745783;
  var url =
    `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${message}`; //&parse_mode=html

  const res = await axios.get(url);
  console.log(res);
};

sendToTelegram();