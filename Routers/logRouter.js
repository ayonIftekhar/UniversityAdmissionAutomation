const express = require("express");
const { fetchData } = require("../Connection");
const router = express.Router();

router.get("/", showLogTable);

async function showLogTable(req, res) {
  if (
    typeof req.session.username === "undefined" ||
    req.session.username !== "admin"
  ) {
    req.flash("error", "Session Expired. Login Again");
    res.redirect("/");
    return;
  }

  var query = `SELECT * FROM LOG_TABLE`;
  var log_table = await fetchData(query);
  res.render("logTable", { table: log_table.rows });
}

module.exports = router;
