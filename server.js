const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");
const config = require("./config");
const main = require("./main");
mongoose.connect(config.MONGODB_URL, {
  useNewUrlParser: true,
});
main().catch((err) => {
  console.log(err);
});
