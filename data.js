const axios = require("axios");

const getData = async () => {
  const res = await axios.post(
    "https://api-bsc.battlecity.io/game/player/battle-history",
    {
      game: "battle_city_tank",
      system: "battle_city",
      api_key: "Z5hjpcEGxGfhzVSCGFLY",
      chain: "bsc",
    }
  );
  //   console.log(res.data.result.data);
  const originData = res.data.result.data;
  const room_ids = getRoomId(originData);
  const getLast = getLastData(originData, room_ids);
  const fs = require("fs");
  fs.writeFile("./last-data.json", JSON.stringify(getLast), function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
  const p2e = getLast.filter((f) => f.type === "p2e");
  const pvp = getLast.filter((f) => f.type === "pvp");

  fs.writeFile("./last-data-p2e.json", JSON.stringify(p2e), function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });

  fs.writeFile("./last-data-pvp.json", JSON.stringify(pvp), function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
};

const getRoomId = (data) => {
  return Array.from(
    new Set(
      data
        .map((m) => m?.room_id)
        .sort((a, b) => {
          return b.change_at - a.change_at;
        })
    )
  );
};

const getLastData = (data, room_ids) => {
  let lastData = [];
  for (const r of room_ids) {
    const findD = data.filter((f) => f.room_id === r);
    lastData = [...lastData, ...findD];
  }
  return lastData.map((m) => {
    const { tank, __v, del_flag, ...x } = m;
    return {
      chain: m?.chain,
      type: m?.type,
      room_id: m?.room_id,
      player: m?.player,
      status: m?.status,
      point: m?.point,
      ...x,
    };
  });
};

getData();
