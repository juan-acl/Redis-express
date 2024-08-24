require("dotenv").config();
const express = require("express");
const cors = require("cors");
const redis = require("redis");
const bodyParser = require("body-parser");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const connetRedisInstance = async () => {
  const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  });

  await client.connect();
  return client;
};

app.all("/", async (req, res) => {
  return res.status(200).json({ message: "Testing successful" });
});

app.post("/getHotels", async (req, res) => {
  try {
    const connetRedis = await connetRedisInstance();
    const cache = await connetRedis.get("hotels");
    if (cache) return res.status(200).json({ data: JSON.parse(cache) });
    const URL_HOTELS = process.env.URL_HOTELS;
    const response = await fetch(URL_HOTELS, { method: "POST" });
    const responseHotels = await response.json();
    connetRedis.set("hotels", JSON.stringify(responseHotels));
    return res.status(200).json({ data: responseHotels });
  } catch (error) {
    return res.status(500).json({ errorMessage: error.message });
  }
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
