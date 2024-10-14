const express = require("express");
const { fetchData } = require("../Connection");
const bcrypt = require("bcrypt");

const router = express.Router();

router.get("/", getLogIn);
router.post("/", handleLogInRegister);

async function getLogIn(req, res) {
  try {
    req.session.username = undefined;
    const errorMessage = req.flash("error")[0];
    res.render("login", { error: errorMessage });
  } catch (error) {
    console.error("Error in getLogIn:", error);
    res.render("login", { error: "An error occurred. Please try again." });
  }
}

async function handleLogInRegister(req, res) {
  try {
    const {
      username,
      password,
      rollNumber,
      session,
      newUsername,
      newPassword,
      confirmPassword,
    } = req.body;

    const isRegisterView = req.body.registerView === "true"; // Check if the request is from the register view

    if (isRegisterView) {
      const sessionQuery = `SELECT year FROM Ad_process WHERE roll = ${rollNumber} AND year = '${session}'`;
      const sessionCheck = await fetchData(sessionQuery);

      if (
        sessionCheck.rows.length === 0 ||
        sessionCheck.rows[0][0] !== session
      ) {
        // roll and session do not exist
        res.render("login", {
          register: true,
          registerError: `${rollNumber} roll does not exist in session ${session}`,
        });
      } else {
        // check if already registered
        const alreadyRegisteredQuery = `SELECT user_name FROM Student WHERE roll = ${rollNumber}`;
        const alreadyRegistered = await fetchData(alreadyRegisteredQuery);

        if (alreadyRegistered.rows[0][0] != null) {
          // already registered
          res.render("login", {
            error: "User already registered. Please login instead.",
          });
        } else {
          // roll number is ok

          const userNameExistanceQuery = `SELECT user_name FROM User_info WHERE user_name = '${newUsername}'`;
          const userNameExistance = await fetchData(userNameExistanceQuery);

          if (userNameExistance.rows.length) {
            res.render("login", {
              register: true,
              registerError:
                "Username already exists. Please choose a different one.",
            });
          } else {
            // username is ok
            if (newPassword !== confirmPassword) {
              res.render("login", {
                register: true,
                registerError: "Confirm password does not match",
              });
            } else {
              // password is ok
              var password_to_input = await encrypt_password(newPassword);
              registerQuery = `INSERT INTO USER_INFO VALUES ('${newUsername}', '${password_to_input}', 'student')`;
              await fetchData(registerQuery);
              registerQuery = `UPDATE Student SET user_name = '${newUsername}' WHERE roll = ${rollNumber}`;
              await fetchData(registerQuery);
              await fetchData("COMMIT");

              res.render("login", {
                error: "Registration successful. You can now login.",
              });
            }
          }
        }
      }
    } else {
      // Handle login logic
      const query = `SELECT password, category FROM USER_INFO WHERE user_name = '${username}'`;

      try {
        const result = await fetchData(query);

        if (result.rows.length === 0) {
          console.log("wrong username");
          res.render("login", { error: "Username does not exist!" });
        } else {
          const correctPassword = result.rows[0][0];
          const passwordsMatch = await comparePasswords(
            password,
            correctPassword
          );

          if (passwordsMatch) {
            const category = result.rows[0][1];

            req.session.username = username;

            res.redirect(`/${category}`);
          } else {
            res.render("login", { error: "Wrong Password!" });
            console.log("wrong password");
          }
        }
      } catch (error) {
        console.error("Error during login:", error);
        res.render("login", { error: "Error during login. Please try again." });
      }
    }
  } catch (error) {
    console.error("Error in handleLogInRegister:", error);
    res.render("login", { error: "An error occurred. Please try again." });
  }
}

async function encrypt_password(password) {
  const saltRounds = 10;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
}

async function comparePasswords(plainPassword, hashedPassword) {
  try {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match; // 'match' is a boolean indicating whether the passwords match
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw error;
  }
}

module.exports = router;
