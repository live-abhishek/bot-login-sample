require("dotenv-extended").load();
const express = require("express");
const bodyParser = require("body-parser");
const builder = require("botbuilder");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.post("/api/sendmessage", function(req, res) {
  var txtMsg = req.body.msg;
  var addressString = req.body.addressString;
  bot.sendMessage(txtMsg, JSON.parse(addressString));
  res.status(200).send();
});

var inMemoryStorage = new builder.MemoryBotStorage();
var connector = new builder.ChatConnector({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword
});

app.post("/api/messages", connector.listen());

var bot = new builder.UniversalBot(connector, function(session) {
  session.send("You said: %s", session.message.text);
  const msg = new builder.Message(session);
  msg.attachmentLayout(builder.AttachmentLayout.carousel);
  msg.attachments([
    new builder.HeroCard(session)
      .title("Login Card")
      .subtitle("Username: asdf; password: asdf")
      .text(
        "Clicking this card will open a web page where user can login. Once login is succesful, user will be presented a welcome message."
      )
      .buttons([
        builder.CardAction.openUrl(
          session,
          `${process.env.botAppUrl}/login?address=${encodeURI(
            JSON.stringify(session.message.address)
          )}`,
          "click me"
        )
      ])
  ]);
  session.send(msg).endDialog();
}).set("storage", inMemoryStorage);

app.get("/login", function(req, res) {
  res.render("login");
});

app.post("/login", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const address = JSON.parse(decodeURI(req.query.address));

  const msg = new builder.Message().address(address);
  msg.text("Welcome! Login successful!");
  bot.send(msg);

  res.render("login", {
    address: req.query.address,
    message: "Login successful! Please continue with the bot."
  });
});

var port = process.env.port || process.env.PORT || 3977;
app.listen(port, function() {
  console.log("Web Server listening on port %s", port);
});
