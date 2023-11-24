import mongoose from "mongoose";
mongoose.set("strictQuery", true); //^ just for mongoDB warning

const DBconnection = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`DB Connected : ${connection.host}`.cyan.underline);
  } catch (error) {
    console.log(`Error is : ${error.message}`.red.bold);
    process.exit(1);
  }
};
export { DBconnection };
