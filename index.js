document.getElementById("start").addEventListener("click", (e) => {
  run();
});

const getBalance = async () => {
  var formData = new FormData();
  formData.append("uid", 534510);
  formData.append(
    "sign",
    "9CE3A8C7FB3B078E532D568A6751705451C04A4985B519EEBF8D892C47AB4AB6"
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
  console.log(result.data);
  document.getElementById("balance").innerText = result.data.data.Amount;
};
getBalance();

const run = () => {
  let issuenumberEntry = Number(document.getElementById("issuseNum").value);
  let id = document.getElementById("id").value;
  let sign = document.getElementById("sign").value;
  console.log(id,sign)
  getBalance();
  const main = async (issueNum, select) => {
    try {
      var formData = new FormData();
      formData.append("uid", 534510);
      formData.append(
        "sign",
        "9CE3A8C7FB3B078E532D568A6751705451C04A4985B519EEBF8D892C47AB4AB6"
      );
      formData.append("amount", "1000");
      formData.append("betcount", "1");
      formData.append("gametype", "2");
      formData.append("selecttype", select || "small");
      formData.append("issuenumber", issueNum);
      formData.append("language", "vi");
      formData.append("typeid", 1);

      const result = await axios.post(
        "https://92lotteryapi.com/api/webapi/GameBetting",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(result.data);
      await getBalance();
    } catch (error) {
      console.log(error);
    }
  };
  main(issuenumberEntry);

  setInterval(() => {
    issuenumberEntry = issuenumberEntry + 1;
    console.log(issuenumberEntry.toString().slice());
    console.log("go - " + issuenumberEntry);

    main(issuenumberEntry, predict());
  }, 1000 * 60);

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  const predict = () => {
    const random = getRandomInt(9);
    console.log(random);
    if (random < 5) {
      return "small";
    }
    return "big";
  };
};
