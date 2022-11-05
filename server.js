const express = require("express");
const dotenv = require("dotenv");
var path = require("path");
var rfs = require("rotating-file-stream");
const connectDB = require("./config/db");
const colors = require("colors");
const errorHandler = require("./middleware/error");
var morgan = require("morgan");
const logger = require("./middleware/logger");
const fileupload = require("express-fileupload");
// Router оруулж ирэх
const categoriesRoutes = require("./routes/categories");
const goodsRoutes = require("./routes/goods");
const countsRoutes = require("./routes/counts");
const barcodesRoutes = require("./routes/barcodes");
const countNamesRoutes = require("./routes/countNames");
const usersRoutes = require("./routes/users");
const templatesRoutes = require("./routes/templates");
const billsRoutes = require("./routes/bills");
const transactionsRoutes = require("./routes/transactions");
const walletsRoutes = require("./routes/wallets");
const cors = require("cors");
var cookieParser = require("cookie-parser");

const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
var xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
// Аппын тохиргоог process.env рүү ачаалах
dotenv.config({ path: "./config/config.env" });


const app = express();

connectDB();

// create a write stream (in append mode)
var accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "log"),
});

var whitelist = ["http://localhost:3000","http://naimaaadmin.com", "http://www.naimaaadmin.com", "https://naimaaadmin.com", "https://www.naimaaadmin.com"  ];

var corsOptions = {
  origin: function (origin, callback) {
    console.log(origin);
    if (origin === undefined || whitelist.indexOf(origin) !== -1) {
      // Энэ домэйнээс манай рест рүү хандахыг зөвшөөрнө
      callback(null, true);
    } else {
      // Энэ домэйнд хандахыг хориглоно.
      callback(new Error("Horigloj baina.."));
    }
  },
  allowedHeaders: "Authorization, Set-Cookie, Content-Type",
  methods: "GET, POST, PUT, DELETE",
  credentials: true,
};
app.use(express.static(path.join(__dirname, "public")));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 100 requests per windowMs
  message: "15 минутанд 3 удаа л хандаж болно! ",
});
app.use(limiter);
// http parameter pollution халдлагын эсрэг books?name=aaa&name=bbb  ---> name="bbb"
app.use(hpp());
// Body parser
app.use(cookieParser());
app.use(logger);
app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet());
app.use(xss());
// To remove data, use:
app.use(mongoSanitize());
app.use(fileupload());
app.use(morgan("combined", { stream: accessLogStream }));
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/goods", goodsRoutes);
app.use("/api/v1/counts", countsRoutes);
app.use("/api/v1/barcodes", barcodesRoutes);
app.use("/api/v1/countNames", countNamesRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/bills", billsRoutes);
app.use("/api/v1/templates", templatesRoutes);
app.use("/api/v1/transactions", transactionsRoutes);
app.use("/api/v1/wallets", walletsRoutes);
app.use(errorHandler);


const server = app.listen(
  process.env.PORT,
  console.log(`Express сэрвэр ${process.env.PORT} порт дээр аслаа... `.rainbow)
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Алдаа гарлаа : ${err.message}`.underline.red.bold);
  server.close(() => {
    process.exit(1);
  });
});
