const mongoose = require("mongoose");

const config = require("../config");

before(async function () {
  this.timeout(30000); // Increase timeout for the connection
  try {
    await mongoose.connect(config.MONGODB_URL, {
      useNewUrlParser: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
});

after(async function () {
  await mongoose.connection.close();
  console.log("Disconnected from MongoDB");
});
