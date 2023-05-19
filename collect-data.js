const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const data = async (page) => {
  try {
    var formData = new FormData();
    // formData.append("uid", 638248);
    // formData.append(
    //   "sign",
    //   "21EE754BC66501934222C68FE0105806C3E71E04403B19DAB37E015C28BC2CD9"
    // );

    formData.append("pageno", page);
    formData.append("language", "vi");
    formData.append("typeid", 1);
    const x = await axios.post(
      "https://92lotteryapi.com/api/webapi/GetNoaverageEmerdList",
      formData
    );
    console.log(`page - `,x.data.data.pageno)
    return x.data.data?.gameslist;
  } catch (error) {
    console.log(error);
  }
};

const collectData = async () => {
  let numpage = new Array(1000).fill(1);
  let i = 1;
  let result = [];
  for await (const it of numpage) {
    const dt = await data(i);
    if (dt && dt.length > 0) {
      result = [...result, ...dt];
      
      if ([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]?.includes(i)) {
        fs.writeFileSync(`./page/page-${i}.json`, JSON.stringify(result));
      }
    }
    i++;
  }

  fs.writeFileSync("./data.json", JSON.stringify(result));
};

collectData();
