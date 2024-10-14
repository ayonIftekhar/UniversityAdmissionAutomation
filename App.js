const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");

const express = require("express");
const PORT = 3000;
const app = express();

const logIn = require("./Routers/logInRouter");
const university = require("./Routers/universityRouter");
const departments = require("./Routers/departmentRouter");
const prereqRouter = require("./Routers/prereqRouter");
const update = require("./Routers/updateRouter");
const student = require("./Routers/studentRouter");
const choice = require("./Routers/choiceRouter");
const choicesConfirmed = require("./Routers/confirmedChoice");
const adminRouter = require("./Routers/adminRouter");
const allocationSee = require("./Routers/seeAllocationRouter");
const logTable = require("./Routers/logRouter");
const uni_allocation = require("./Routers/uniAllocationRouter");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "project8588",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());

app.use("/", logIn);
app.use("/university", university);
app.use("/university/departments", departments);
app.use("/university/prerequisites", prereqRouter);
app.use("/university/update", update);
app.use("/student", student);
app.use("/student/choice", choice);
app.use("/student/choice/confirmedChoices", choicesConfirmed);
app.use("/admin", adminRouter);
app.use("/student/see-allocation", allocationSee);
app.use("/admin/logs", logTable);
app.use("/university/allocation", uni_allocation);

app.listen(PORT, () => {
  console.log("Server Is On...");
});
