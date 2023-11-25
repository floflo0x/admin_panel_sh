if(process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require('express');

const cookieParser = require('cookie-parser');

const session = require('express-session');

const flash = require('connect-flash');

const authRoute = require('./routes/auth');

const userRoute = require('./routes/user');

const request = require('request');

const path = require('path');

const app = express();

app.set("view engine", "ejs");

app.set("views", "views");

const baseUrl = "https://bhaveshnetflix.live/web_api/";

let selectFunction = (item) => {
  let options = {
    method: "POST",
    url: baseUrl + "select.php",
    formData: {
      select_query: item,
    },
  };
  return options;
};

app.enable("trust proxy");

app.use(cookieParser());

app.use(session({
  secret: 'Aiop@5464gd$',
  resave: false,
  proxy: true,
  saveUninitialized: true,
  cookie: { secure: true, sameSite: "none", httpOnly: true },
}));

// Middleware to set the default language to French ('fr')
app.use((req, res, next) => {
  // req.session.isLoggedIn = req.session.isLoggedIn || 'false';
  req.cookies.user = req.cookies.user || '';
  req.session.email = req.session.email || req.cookies.user || '';
  // console.log(req.session.email);
  next();
});

// Middleware to load language based on the session
// app.use((req, res, next) => {
//   const lang = req.session.lang;
//   req.lang = require(`./languages/${lang}.json`);
//   next();
// });

app.use((req, res, next) => {
  if (!req.session.email) {
    return next();
  }

  else {
    let opt1 = selectFunction(
      "select * from users where email = '"
      .concat(`${req.session.email}`)
      .concat("'")
    );

    request(opt1, async (error, response) => {
      if (error) throw new Error(error);
      else {
        let x = JSON.parse(response.body);

        // console.log(x);

        if (x.length >= 1) {
          req.user = x[0];
          return next();
        }

        else {
          console.log("error");
        }
      }
    })
  }
})

app.use(flash());

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use("/", authRoute);
app.use("/v1", userRoute);

app.listen(5000, () => {
	console.log("Listening to localhost PORT 5000......");
})
