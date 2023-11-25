const express = require('express');

const { body, validationResult } = require('express-validator');

const request = require('request');

const router = express.Router();

const baseUrl = 'https://bhaveshnetflix.live/web_api/';

let loginFunction = (item, item2) => {
  let options = {
    method: "POST",
    url: baseUrl + "login.php",
    formData: {
	    'email': item,
    	'password': item2,
  	},
  };
  return options;
};

let insertFunction = (item, item2) => {
  let options = {
    method: "POST",
    url: baseUrl + "insert.php",
    formData: {
      insert_query: item,
      select_query: item2,
    },
  };
  return options;
};

router.get("/", async (req, res, next) => {
	let message = req.flash('error');
	// console.log(message);

	if (message.length > 0) {
		message = message[0];
	}
	else {
		message = null;
	}

	return res.render("auth/login", {
		title: 'Login',
		errorMessage: message,
		oldInput: {
			email: ''
		}
	})
})

router.post("/login", 
	[
		body('email')
			.trim()
			.notEmpty()
			.withMessage('Email Address required')
			.normalizeEmail()
			.isEmail()
			.withMessage('Invalid email or password'),
		body('password')
			.trim()
			.notEmpty()
			.withMessage('Password required')
			.isLength({min: 8})
			.withMessage('Password must be 8 characters long')
			.matches(/(?=.*?[A-Z])/).withMessage('Password must have at least one Uppercase')
  		.matches(/(?=.*?[a-z])/).withMessage('Password must have at least one Lowercase')
  		.matches(/(?=.*?[0-9])/).withMessage('Password must have at least one Number')
  		.matches(/(?=.*?[#?!@$%^&*-])/).withMessage('Password must have at least one special character')
  		.not().matches(/^$|\s+/).withMessage('White space not allowed'),
  ],
	async(req, res, next) => {
		try {
			const { email, password } = req.body;

			// console.log(email, password);

			const error = validationResult(req);

			if (!error.isEmpty()) {
				// console.log(error.array());
				return res.render("auth/login", 
			    { 
						title: 'Login',
			      errorMessage: error.array()[0].msg,
			      oldInput: {
			      	email: email
			      }
			    }
			  );
			}

			else {
				const opt1 = loginFunction(
					`${email}`,
					`${password}`
				);

				request(opt1, async (error, response) => {
					if (error) throw new Error(error);
					else {
						let x = JSON.parse(response.body);

						// console.log(x, x.isSuccess);

						if (x.isSuccess == false) {
							req.flash('error', 'Invalid email or password...');
							return res.redirect("/");
						}

						else {
							let values2 = `\'${email}\', \'true\'`;

							let opt2 = insertFunction(
								"insert into adminSession (email, isLoggedIn) values ("
								.concat(`${values2}`)
								.concat(")"),
								"select * from adminSession where email = '"
								.concat(`${email}`)
								.concat("'")
							);

							request(opt2, (error, response) => {
								if (error) throw new Error(error);
								else {
									let z = JSON.parse(response.body);
									// console.log(z);

									res.cookie('user', email);										      	
														
									req.session.email = email;
									req.session.save(err => {
										if(!err) {
											return res.redirect('/v1/home');
										}
									})
								}
							})
						}
					}
				})
			}
		}
		catch(error) {
			return res.redirect("/");
		}
})

router.post("/logout", async (req, res, next) => {
	req.session.destroy((err) => {
    // console.log(err);
    // res.clearCookie('lang');
    res.clearCookie('user');
    // res.clearCookie('isLoggedIn');
    return res.redirect('/');
  });
})

module.exports = router;