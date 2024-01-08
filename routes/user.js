const express = require('express');

const { body, validationResult } = require('express-validator');

const request = require('request');

const router = express.Router();

const baseUrl = 'https://bhaveshnetflix.live/web_api/';

const isAuth = require('../middleware/is_auth');

let selectFunction = (item) => {
  let options = {
    method: "POST",
    url: baseUrl + "select.php",
    formData: {
      select_query: item,
    },
    headers: {
    	'Content-Type': 'application/json',
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

let updateFunction = (item, item2) => {
  let options = {
    method: "POST",
    url: baseUrl + "update.php",
    formData: {
      update_query: item,
      select_query: item2,
    },
  };
  return options;
};

let deleteFunction = (item, item2) => {
	let options = {
	    method: "POST",
	    url: baseUrl + "delete.php",
	    formData: {
	      delete_query: item,
	      select_query: item2,
	    },
  };
  return options;
};

router.get("/home", isAuth, (req, res, next) => {
	try {
		let opt1 = selectFunction("select COUNT(*) as oLength from ec_orders");

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
	      	else {
	        	let x = await JSON.parse(response.body);

	        	// console.log(x.length);

	        	let opt2 = selectFunction("select COUNT(*) as pLength from ec_products");

	        	request(opt2, async (error, response) => {
	        		if (error) throw new Error(error);
		      		else {
		        		let y = await JSON.parse(response.body);

		        		// console.log(y.length);

		        		let opt3 = selectFunction("select COUNT(*) as cLength from ec_customers");

			        	request(opt3, async (error, response) => {
			        		if (error) throw new Error(error);
			      			else {
			        			let z = await JSON.parse(response.body);

			        			// console.log(z.length);

			        			let opt4 = selectFunction("select COUNT(*) as rLength from ec_reviews");

			        			request(opt4, async (error, response) => {
			        				if (error) throw new Error(error);
			      					else {
			        					let z1 = await JSON.parse(response.body);

			        					// console.log(z1.length);

			        					return res.render("user/home", {
													title: 'Home',
													orders: x[0].oLength,
													products: y[0].pLength,
													customers: z[0].cLength,
													reviews: z1[0].rLength
												})
			        				}
			        			})
			        		}
			        	})
		        	}
	        	})
	        }
		})
	}
	catch(error) {
		return res.redirect("/v1/home");
	}
})

router.get("/orders", isAuth, (req, res, next) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const itemsPerPage = 10;

		let offset = 0;

		if (page == 1) {
			offset = 0;
		}
		else {
			offset = 10 * (page - 1);
		}

		let opt1 = selectFunction(
			`select ec_orders.id, ec_orders.status, ec_orders.amount, ec_orders.shipping_amount, ec_orders.created_at, ec_customers.name as customer, ec_customers.email from ec_orders INNER JOIN ec_customers on ec_orders.user_id = ec_customers.id order by ec_orders.id desc limit 10 offset ${offset}`
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = await JSON.parse(response.body);

				// console.log(x);

				if (x.length >= 1) {
					let opt2 = selectFunction("select COUNT(*) as oLength from ec_orders");

					request(opt2, async (error, response) => {
						if (error) throw new Error(error);
						else {
							let y = JSON.parse(response.body);
							// console.log(y);

							if (y.length >= 1) {
								const totalCount = y[0].oLength;
					 			const pageCount = Math.ceil(totalCount / itemsPerPage);

					 			return res.render("user/orders", {
									title: 'Orders',
									data: x,
									currentPage: page,
									pageCount: pageCount
								})
					 		}

					 		else {
					 			return res.render("user/orders", {
									title: 'Orders',
									data: x,
									currentPage: page,
									pageCount: 0
								})
					 		}
						}
					})
				}
				else {
					return res.render("user/orders", {
						title: 'Orders',
						data: [],
						currentPage: page,
						pageCount: 0
					})
				}
			}
		})
	}
	catch(error) {
		return res.redirect("/v1/home");
	}
})

router.get("/products", isAuth, (req, res, next) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const itemsPerPage = 10;

		let offset = 0;

		if (page == 1) {
			offset = 0;
		}
		else {
			offset = 10 * (page - 1);
		}

		let opt1 = selectFunction(`select * from ec_products order by id desc limit 10 offset ${offset}`);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
      else {
        let x = JSON.parse(response.body);

        if (x.length >= 1) {
        	let opt2 = selectFunction("select COUNT(*) as pLength from ec_products");

        	request(opt2, async (error, response) => {
        		if (error) throw new Error(error);
			      else {
			        let y = JSON.parse(response.body);

			        // console.log(y);

			        if(y.length >= 1) {
			        	const totalCount = y[0].pLength;
							 	const pageCount = Math.ceil(totalCount / itemsPerPage);

							  return res.render("user/products", {
			            title: 'Products',
			            data: x,
							    currentPage: page,
							    pageCount: pageCount
			          })
			        }

			        else {
				      	return res.render("user/products", {
				      		title: 'Products',
				      		data: x,
									currentPage: page,
									pageCount: 0
				      	})
				      }
			      }
        	})
      	}

	      else {
	      	return res.render("user/products", {
	      		title: 'Products',
	      		data: [],
						currentPage: page,
						pageCount: 0
	      	})
	      }
    	}
		})
	}
	catch(error) {
		return res.redirect("/v1/home");
	}
})

router.get("/add-product", isAuth, (req, res, next) => {
	try {
		let message = req.flash('error');
		// console.log(message);

		if (message.length > 0) {
			message = message[0];
		}
		else {
			message = null;
		}

		return res.render("user/add_product", {
			title: "Add Product",
			errorMessage: message,
			editing: false,
      edit: false,
      descriptionfr: '',
			descriptionen: '',
			warranty: '',
			optValue: [],
			affect_price: [],
			optionId: '',
			oldInput: {
				id: '',
				name: '',
			  image: '',
			  content: '',
			  sku: '',
			  price: '',
			  barcode: '',
			  quantity: '',
			  status: 'in_stock',
			  product_type: '',
			  category: '',
			  slug: '',
			  label: ''
			}
		});
	}
	catch(error) {
		return res.redirect("/v1/home");
	}
})

router.post("/post-product",
	[
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name Required')
      // .matches(/^[a-zA-Z0-9\s]+$/)
      .matches(/^[^@#$%&*]+$/)
      .withMessage('Only Characters with white space and numbers are allowed'),
    body('descriptionfr')
      .trim()
      .notEmpty()
      .withMessage('Description (Français) required'),
    body('descriptionen')
      .trim()
      .notEmpty()
      .withMessage('Description (English) required'),
    body('price')
      .trim()
      .notEmpty()
      .withMessage('Price required')
      .isFloat({ min: 0, max: 1000 })
      .withMessage('Price must be an integer between 0 and 1000'),
    body('quantity')
      .trim()
      .notEmpty()
      .withMessage('quantity required')
      .isInt({ min: 0, max: 20 })
      .withMessage('Price must be an integer between 0 and 1000'),
    body('status')
      .trim()
      .notEmpty()
      .isIn(['in_stock', 'out_of_stock', 'on_backorder'])
      .withMessage('Select a valid Status'),
    body('category')
		  .if(body('category').notEmpty())
		  .isIn(['1', '31', '32'])
		  .withMessage('Select a valid Category'),
    body('slug')
      .if(body('slug').notEmpty())
      .isIn(['1', '2', '3', '0'])
      .withMessage('Select a valid Product Collections'),
    body('label')
      .if(body('label').notEmpty())
      .isIn(['1', '2', '3', '0'])
      .withMessage('Select a valid Labels'),
   	body('warranty')
      .trim()
      .notEmpty()
      .withMessage('Please Select a valid warranty Value')
      .isIn(['Garantie', 'Abonnement', 'Options', 'Option'])
      .withMessage('Select valid Options'),
    body('affect_price')
      .trim()
      .notEmpty()
      .withMessage('Option Price required')
      .isFloat({ min: 0, max: 1000 })
      .withMessage('Option Price must be an integer between 0 and 1000'),
    body('optValue')
      .trim()
      .notEmpty()
    	//.isIn(['1 Mois', '12 Mois', 'à VIE', 'à VIE + Privé', 'Solo', 'Duo', 'Tribu', 'Pack Standard', 'Pack Premium', 'Partager', '100% Privé'])
      .withMessage('Invalid Options Value')
      .matches(/^[^@#$%&*]+$/)
      .withMessage('Only Characters with white space and numbers are allowed'),
  ],
	async (req, res, next) => {
		try {
			// console.log(req.body);

			const { name, descriptionfr, descriptionen, content, imageUrl, sku, price, barcode, quantity, status, product_type, affect_price } = req.body;

			let segments = descriptionfr.split('-').filter(Boolean); // Split the string and remove empty segments

			let formattedDescription = segments.map(segment => `<p>- ${segment.replace(/'/g, "\\'")}</p>`).join('');

			let segments2 = descriptionen.split('-').filter(Boolean); // Split the string and remove empty segments

			let formattedDescription2 = segments2.map(segment => `<p>- ${segment.replace(/'/g, "\\'")}</p>`).join('');
			// console.log(category, label, slug);

			const warranty = req.body.warranty;
			const optValue = req.body.optValue;
			const category = req.body.category;
			const slug = req.body.slug;
			const label = req.body.label;

			// console.log(warranty, optValue, affect_price, typeof optValue);
			// console.log(formattedDescription, formattedDescription2);
			// console.log(req.body, category, slug, label, category !== undefined, slug !== undefined);

			const error = validationResult(req);

      if (!error.isEmpty()) {
      	// console.log(error.array()[0].msg);
        return res.render("user/add_product", 
          { 
            title: "Add Product", 
            // isAuthenticated: req.session.isLoggedIn,
            errorMessage: error.array()[0].msg,
            editing: true,
            edit: false,
            descriptionfr: descriptionfr,
						descriptionen: descriptionen,
						warranty: warranty,
						optValue: optValue,
						affect_price: affect_price,
						optionId: '',
            oldInput: {
              name: name,
						  content: content,
						  image: imageUrl,
						  sku: sku,
						  price: price,
						  barcode: barcode,
						  quantity: quantity,
						  status: status,
						  product_type: 'digital',
						  category: category,
						  slug: slug,
						  label: label
			      },
          }
        );
      }

      else {
				const currentDate = new Date();

				const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

				// console.log(formattedDate);

      	const values = `\'${name}\', \'${formattedDescription}\', \'\', \'published\', null, null, \'0\', \'${quantity}\', \'0\', \'0\', \'0\', \'0\', \'0\', \'0\', \'${price}\', null, null, null, null, null, null, null, null, \'0\', \'${formattedDate}\', null, \'${status}\', \'1\', \'Botble\\\\ACL\\\\Models\\\\User\', \'${imageUrl}\', \'digital\', null, \'0\'`;

				const opt1 = insertFunction(
					'INSERT INTO ec_products(name, description, content, `status`, images, sku, `order`, quantity, allow_checkout_when_out_of_stock, with_storehouse_management, is_featured, brand_id, is_variation, sale_type, price, sale_price, start_date, end_date, length, wide, height, weight, tax_id, `views`, created_at, updated_at, stock_status, created_by_id, created_by_type, image, product_type, barcode, cost_per_item) VALUES ('
				    .concat(`${values}`)
				    .concat(")"),
				  "select * from ec_products where name = \'"
				  	.concat(`${name}`)
				  	.concat("\' order by id desc limit 10 offset 0")
				);

				request(opt1, function (error, response) {
				  if (error) throw new Error(error);
				  else {
					  // console.log(response.body);

					  let x = JSON.parse(response.body);

					  // console.log(x);

					  if (x.length >= 1) {
					  	const id = x[0].id;
					  	// console.log(id);

					  	if (category !== undefined && category) {
					  		const value1 = `\'${category}', \'${id}\'`;
					  		const opt2 = insertFunction(
					  			"insert into ec_product_category_product (category_id, product_id) values ("
					  				.concat(`${value1}`)
					  				.concat(")"),
					  			"select * from ec_product_category_product where product_id = \'"
					  				.concat(`${id}`)
					  				.concat("\' limit 10 offset 0")
					  		);

					  		request(opt2, function (error, response) {
								  if (error) throw new Error(error);
								  else {
									  // console.log(response.body);
									  let y = JSON.parse(response.body);

									  // console.log(y);
									}
								})
					  	}

					  	if (slug !== undefined && slug !== 0) {
					  		const value2 = `\'${slug}', \'${id}\'`;
					  		const opt3 = insertFunction(
					  			"insert into ec_product_collection_products (product_collection_id, product_id) values ("
					  				.concat(`${value2}`)
					  				.concat(")"),
					  			"select * from ec_product_collection_products where product_id = \'"
					  				.concat(`${id}`)
					  				.concat("\' limit 10 offset 0")
					  		);

					  		request(opt3, function (error, response) {
								  if (error) throw new Error(error);
								  else {
									  // console.log(response.body);
									  let z = JSON.parse(response.body);

									  // console.log(z);
									}
								})
					  	}

					  	if (label !== undefined && label !== 0) {
					  		const value3 = `\'${label}', \'${id}\'`;
					  		const opt4 = insertFunction(
					  			"insert into ec_product_label_products (product_label_id, product_id) values ("
					  				.concat(`${value3}`)
					  				.concat(")"),
					  			"select * from ec_product_label_products where product_id = \'"
					  				.concat(`${id}`)
					  				.concat("\' limit 10 offset 0")
					  		);

					  		request(opt4, function (error, response) {
								  if (error) throw new Error(error);
								  else {
									  // console.log(response.body);

									  let z1 = JSON.parse(response.body);

									  // console.log(z1);
									}
								})
					  	}

					  	if (warranty) {
					  		const value4 = `\'${warranty}', \'null\', \'${id}\', \'0\', \'1\', \'${formattedDate}\', \'${formattedDate}\'`;

					  		const opt5 = insertFunction(
					  			"INSERT INTO ec_options(name, option_type, product_id, `order`, required, created_at, updated_at) VALUES ("
					  				.concat(`${value4}`)
					  				.concat(")"),
					  			"select * from ec_options where product_id = "
					  				.concat(`${id}`)
					  				.concat(" order by id desc limit 10 offset 0 ")
					  		);

					  		request(opt5, function (error, response) {
								  if (error) throw new Error(error);
								  else {
									  // console.log(response.body);

									  let z2 = JSON.parse(response.body);

									  // console.log(z2);

									  if (z2.length >= 1 && optValue) {
									  	const id2 = z2[0].id;
									  	// console.log(id2);

									  	// const optionValues = [
											//   { value: '1 Mois', affectPrice: '0', order: '0', affectType: '0' },
											//   { value: '12 Mois', affectPrice: '0', order: '0', affectType: '0' },
											//   { value: 'à VIE', affectPrice: '0', order: '0', affectType: '0' },
											// ];

											const optionValues = [];
                      
                      if (typeof optValue == 'object' && typeof affect_price == 'object') {
                        optValue.forEach((val, index) => {
                          optionValues.push({
                            value: val,
                            // value: val.replace(/'/g, "\\'"),
                            affectPrice: affect_price[index], order: '0', affectType: '0'
                          })
                        })
                      }
                      else {
                        optionValues.push({
													value: optValue,
													// value: optValue.replace(/'/g, "\\'"),
													affectPrice: affect_price, order: '0', affectType: '0'
												})
                      }

											// console.log(optionValues);

											// Generate the SQL query
											const sqlQuery = `INSERT INTO ec_option_value (option_id, option_value, affect_price, \`order\`, affect_type, created_at, updated_at) VALUES 
											${optionValues.map(({ value, affectPrice, order, affectType }) => `('${id2}', '${value}', '${affectPrice}', '${order}', '${affectType}', '${formattedDate}', '${formattedDate}')`).join(', ')};`;

											const opt6 = insertFunction(
												sqlQuery,
												"select * from ec_option_value where option_id = "
													.concat(`${id2}`)
													.concat(" order by id desc limit 10 offset 0")
											);

											request(opt6, function (error, response) {
											  if (error) {
											    throw new Error(error);
											  } else {
											    // console.log(response.body);
											    let z3 = JSON.parse(response.body);
											    // console.log(z3);
											  }
											});
									  }
									}
								})
					  	}

					  	const value6 = `\'en_US\', \'${id}\', \'${name}\', \'${descriptionen}\'`;

					  	const opt7 = insertFunction(
					  		"INSERT INTO `ec_products_translations`(`lang_code`, `ec_products_id`, `name`, `description`) VALUES ("
					  			.concat(`${value6}`)
					  			.concat(")"),
					  		"SELECT * FROM ec_products_translations where ec_products_id = "
					  			.concat(`${id}`)
					  			.concat(" order by ec_products_id desc limit 10 offset 0 ")
					  	);

					  	request(opt7, function (error, response) {
							  if (error) throw new Error(error);
							  else {
							  	let z4 = JSON.parse(response.body);

							  	// console.log(z4);
							  }
							})

					  	return res.redirect('/v1/products');
					  }

					  else {
							req.flash('error', 'Failed to add product, try again...');
					  	return res.redirect('/v1/add-product');
					  }
					}
				});
      }
		}
		catch(error) {
			return res.redirect("/v1/add-product");
		}
})

router.get("/edit-product/:id", isAuth, (req, res, next) => {
	try {
		const { id } = req.params;
		// console.log(id);

		let message = req.flash('error');
		// console.log(message);

		if (message.length > 0) {
			message = message[0];
		}
		else {
			message = null;
		}

		// const opt1 = selectFunction(
		// 	`select ec_orders.id, ec_orders.status, ec_orders.price, ec_orders.amount, ec_orders.shipping_amount, ec_orders.created_at, ec_customers.name as customer from ec_orders INNER JOIN ec_customers on ec_orders.user_id = ec_customers.id where ec_orders.id = ${id} limit 10 offset 0`
		// );

		const opt1 = selectFunction(
			`select ec_products.id, ec_products.name as pName, ec_products.description, ec_products_translations.description as descriptionen, ec_products.content, ec_products.quantity, ec_products.sku, ec_products.price, ec_products.barcode, ec_products.stock_status, ec_products.image, ec_product_categories.id as category, ec_product_labels.id as label, ec_product_collections.id as slug, ec_options.name AS warranty, GROUP_CONCAT(ec_option_value.option_value) AS options, GROUP_CONCAT(ec_option_value.affect_price) as affect_price, GROUP_CONCAT(ec_option_value.id) as optionId from ec_products left join ec_product_category_product on ec_product_category_product.product_id = ec_products.id left join ec_product_categories on ec_product_categories.id = ec_product_category_product.category_id left join ec_product_label_products on ec_product_label_products.product_id = ec_products.id left join ec_product_labels on ec_product_labels.id = ec_product_label_products.product_label_id left join ec_product_collection_products on ec_product_collection_products.product_id = ec_products.id left join ec_product_collections on ec_product_collections.id = ec_product_collection_products.product_collection_id left join ec_products_translations on ec_products_translations.ec_products_id = ec_products.id LEFT JOIN ec_options ON ec_options.product_id = ec_products.id LEFT JOIN ec_option_value ON ec_options.id = ec_option_value.option_id where ec_products.id = ${id} limit 10 offset 0`
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = JSON.parse(response.body);

				// console.log(x);

				if (x.length == 1) {
					if (x[0].options !== null && x[0].options.includes(",")) {
        		x[0].options = x[0].options.split(",");
    			}

	    		if (x[0].affect_price !== null && x[0].affect_price.includes(",")) {
	        	x[0].affect_price = x[0].affect_price.split(",");
	    		}

	    		if (x[0].optionId !== null && x[0].optionId.includes(",")) {
	        	x[0].optionId = x[0].optionId.split(",");
	    		}
					
					return res.render("user/add_product", {
						title: "Edit Product",
						errorMessage: message,
						editing: true,
            edit: true,
						descriptionfr: x[0].description,
						descriptionen: x[0].descriptionen,
						warranty: x[0].warranty,
						optValue: x[0].options,
						affect_price: x[0].affect_price,
						optionId: x[0].optionId,
						oldInput: {
							id: x[0].id,
							name: x[0].pName,
						  image: x[0].image,
						  content: x[0].content,
						  sku: x[0].sku,
						  price: x[0].price,
						  barcode: x[0].barcode,
						  quantity: x[0].quantity,
						  status: x[0].stock_status,
						  product_type: 'digital',
						  category: x[0].category,
						  slug: x[0].slug,
						  label: x[0].label
						}
					});
				}

				else {
					return res.redirect("/v1/products");
				}
			}
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect('/v1/products');
	}
})

router.post("/postEditProduct",
	[
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name Required')
      // .matches(/^[a-zA-Z0-9\s]+$/)
      .matches(/^[^@#$%&*]+$/)
      .withMessage('Only Characters with white space and numbers are allowed'),
   body('descriptionfr')
      .trim()
      .notEmpty()
      .withMessage('Description (Français) required'),
    body('descriptionen')
      .trim()
      .notEmpty()
      .withMessage('Description (English) required'),
    body('price')
      .trim()
      .notEmpty()
      .withMessage('Price required')
      .isFloat({ min: 0, max: 1000 })
      .withMessage('Price must be an integer between 0 and 1000'),
    body('quantity')
      .trim()
      .notEmpty()
      .withMessage('quantity required')
      .isInt({ min: 0, max: 20 })
      .withMessage('Price must be an integer between 0 and 1000'),
    body('status')
      .trim()
      .notEmpty()
      .isIn(['in_stock', 'out_of_stock', 'on_backorder'])
      .withMessage('Select a valid Status'),
    body('category')
		  .if(body('category').notEmpty())
		  .isIn(['1', '31', '32'])
		  .withMessage('Select a valid Category'),
    body('slug')
      .if(body('slug').notEmpty())
      .isIn(['1', '2', '3', '0'])
      .withMessage('Select a valid Product Collections'),
    body('label')
      .if(body('label').notEmpty())
      .isIn(['1', '2', '3', '0'])
      .withMessage('Select a valid Labels'),
  ], 
	async (req, res, next) => {
		try {
			// console.log(req.body);

			// const { product_id, name, descriptionfr, descriptionen, content, imageUrl, sku, price, barcode, quantity, status, product_type, category, slug, label, affect_price } = req.body;
			const { product_id, name, descriptionfr, descriptionen, content, imageUrl, sku, price, barcode, quantity, status, product_type, category, slug, label } = req.body;
      
      let segments = descriptionfr.split('-').filter(Boolean); // Split the string and remove empty segments

			let formattedDescription = segments.map(segment => `<p>- ${segment.replace(/'/g, "\\'")}</p>`).join('');

			let segments2 = descriptionen.split('-').filter(Boolean); // Split the string and remove empty segments

			let formattedDescription2 = segments2.map(segment => `<p>- ${segment.replace(/'/g, "\\'")}</p>`).join('');

			// console.log(formattedDescription, formattedDescription2);

			const warranty = req.body.warranty;
			let optValue = req.body.optValue;
			let affect_price = req.body.affect_price;

			// console.log("hii...", req.body);

			const error = validationResult(req);

      if (!error.isEmpty()) {
      	// console.log(error.array()[0].msg);
      	if (optValue !== null && optValue.includes(",")) {
        	optValue = optValue.split(",");
    		}

	    	if (affect_price !== null && affect_price.includes(",")) {
	       	affect_price = affect_price.split(",");
	    	}

      	return res.render("user/add_product", 
			    { 
			      title: "Add Product", 
			      errorMessage: error.array()[0].msg,
			      editing: true,
			      edit: true,
						descriptionfr: descriptionfr,
						descriptionen: descriptionen,
						warranty: warranty,
						optValue: optValue,
						affect_price: affect_price,
						optionId: [],
			      oldInput: {
			      	id: product_id,
			        name: name,
						  content: content,
						  image: imageUrl,
						  sku: sku,
						  price: price,
						  barcode: barcode,
						  quantity: quantity,
						  status: status,
						  product_type: 'digital',
						  category: category,
						  slug: slug,
						  label: label
				  	},
			    }
			  );
      }

      else {
        const currentDate = new Date();

				const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

				// console.log(formattedDate);

      	const opt1 = updateFunction(
      		"UPDATE ec_products SET name = '"
      			.concat(`${name}`)
      			.concat("', description = '")
      			.concat(`${formattedDescription}`)
      			.concat("', `order`='0', quantity='0'")
      			.concat(", price = '")
      			.concat(`${price}`)
      			.concat("', updated_at = '")
      			.concat(`${formattedDate}`)
      			.concat("', stock_status = '")
      			.concat(`${status}`)
      			.concat("', image = '")
      			.concat(`${imageUrl}`)
      			.concat("' where id = '")
      			.concat(`${product_id}`)
      			.concat("'"),
      		"select * from ec_products where id = '"
      			.concat(`${product_id}`)
      			.concat("' limit 10 offset 0")
      	);

      	// console.log(opt1);

      	request(opt1, (error, response) => {
          if (error) throw new Error(error);
          else {
            let x = JSON.parse(response.body);

            // console.log(x);

            if (x.length == 1) {
            	if (category !== undefined && category) {
            		const opt2 = updateFunction(
            			"update ec_product_category_product set category_id = '"
            				.concat(`${category}`)
            				.concat("' where product_id = '")
            				.concat(`${product_id}`)
            				.concat("'"),
            			"select * from ec_product_category_product where product_id = '"
            				.concat(`${product_id}`)
            				.concat("' limit 10 offset 0")
            		);

            		request(opt2, async (error, response) => {
            			if (error) throw new Error(error);
				          else {
				            let y = JSON.parse(response.body);

				            // console.log(y);
				          }
            		})
            	}

            	if (label !== undefined && label !== 0) {
            		const opt3 = updateFunction(
            			"update ec_product_label_products set product_label_id = '"
            				.concat(`${label}`)
            				.concat("' where product_id = '")
            				.concat(`${product_id}`)
            				.concat("'"),
            			"select * from ec_product_label_products where product_id = '"
            				.concat(`${product_id}`)
            				.concat("' limit 10 offset 0")
            		);

            		request(opt3, async (error, response) => {
            			if (error) throw new Error(error);
				          else {
				            let z = JSON.parse(response.body);

				            // console.log(z);
				          }
            		})
            	}

            	if (slug !== undefined && slug !== 0) {
            		const opt4 = updateFunction(
            			"update ec_product_collection_products set product_collection_id = '"
            				.concat(`${slug}`)
            				.concat("' where product_id = '")
            				.concat(`${product_id}`)
            				.concat("'"),
            			"select * from ec_product_collection_products where product_id = '"
            				.concat(`${product_id}`)
            				.concat("' limit 10 offset 0")
            		);

            		request(opt4, async (error, response) => {
            			if (error) throw new Error(error);
				          else {
				            let z1 = JSON.parse(response.body);

				            // console.log(z1);
				          }
            		})
            	}

            	if (label !== undefined && label == 0 && slug !== undefined || slug == 0) {
            		if (label == 0) {
	            		const opt5 = deleteFunction(
	            			"delete from ec_product_label_products where product_id = '"
	            				.concat(`${product_id}`)
	            				.concat("'"),
	            			"null"
	            		);

	            		request(opt5, async (error, response) => {
	            			if (error) throw new Error(error);
					          else {}
	            		})
	            	}

	            	else {
	            		const opt6 = deleteFunction(
	            			"delete from ec_product_collection_products where product_id = '"
	            				.concat(`${product_id}`)
	            				.concat("'"),
	            			"null"
	            		);

	            		request(opt6, async (error, response) => {
	            			if (error) throw new Error(error);
					          else {}
	            		})
	            	}
            	}

            	const opt7 = updateFunction(
            		"update ec_products_translations set description = '"
            			.concat(`${descriptionen}`)
            			.concat("' where ec_products_id = '")
            			.concat(`${product_id}`)
            			.concat("'"),
            		"SELECT * FROM ec_products_translations where ec_products_id = "
					  			.concat(`${product_id}`)
					  			.concat(" order by ec_products_id desc limit 10 offset 0 ")
            	);

            	request(opt7, async (error, response) => {
	            	if (error) throw new Error(error);
					      else {}
	           	})

				    	return res.redirect('/v1/products');
            }

            else {
            	return res.redirect('/v1/products');
            }
          }
        });
      }
		}
		catch(error) {
			console.log(error);
			return res.redirect('/v1/products');
		}
})

router.get("/editOptions/:id", isAuth, (req, res, next) => {
	try {
		const { id } = req.params;
		// console.log(id);

		let message = req.flash('error');
		// console.log(message);

		if (message.length > 0) {
			message = message[0];
		}
		else {
			message = null;
		}

		const opt1 = selectFunction(
			`select ec_products.id, ec_options.name AS warranty, GROUP_CONCAT(ec_option_value.option_value) AS options, GROUP_CONCAT(ec_option_value.affect_price) as affect_price, GROUP_CONCAT(ec_option_value.id) as optionId from ec_products left join ec_options ON ec_options.product_id = ec_products.id LEFT JOIN ec_option_value ON ec_options.id = ec_option_value.option_id where ec_products.id = ${id} limit 10 offset 0`
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = JSON.parse(response.body);

				// console.log(x);

				if (x.length == 1) {
					if (x[0].options !== null && x[0].options.includes(",")) {
        		x[0].options = x[0].options.split(",");
    			}

	    		if (x[0].affect_price !== null && x[0].affect_price.includes(",")) {
	        	x[0].affect_price = x[0].affect_price.split(",");
	    		}

	    		if (x[0].optionId !== null && x[0].optionId.includes(",")) {
	        	x[0].optionId = x[0].optionId.split(",");
	    		}
					
					return res.render("user/editOptions", {
						title: "Edit Options",
						errorMessage: message,
						warranty: x[0].warranty,
						optValue: x[0].options,
						affect_price: x[0].affect_price,
						optionId: x[0].optionId,
						oldInput: {
							id: x[0].id,
						}
					});
				}

				else {
					return res.redirect("/v1/products");
				}
			}
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect('/v1/products');
	}
})

router.get("/delOption", isAuth, (req, res, next) => {
	try {
		const { oid, pid } = req.query;

		// console.log(req.query);

		const opt1 = selectFunction(
			`SELECT * FROM ec_option_value where id = ${oid}`
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = JSON.parse(response.body);

				// console.log(x);

				if (x.length >= 1) {
					return res.render("user/deleteOptions", {
						title: "Delete Options",
						optValue: x[0].option_value,
						affect_price: x[0].affect_price,
						optionId: x[0].id,
						pid: pid,
					});
				}

				else {
					return res.redirect("/v1/products");
				}
			}
		})
	}

	catch(error) {
		console.log(error);
		return res.redirect('/v1/products');
	}
})

router.post("/delOptions", isAuth, async(req, res, next) => {
	try {
		// console.log(req.body);

		const { oid, pid } = req.body;

		if (oid !== undefined && pid !== undefined) {
			const opt1 = selectFunction(
				"select option_id from ec_option_value where id = '"
					.concat(`${oid}`)
					.concat("'")
			);

			request(opt1, async (error, response) => {
				if (error) throw new Error(error);
				else {
					let x = JSON.parse(response.body);

					// console.log(x);

					if (x.length >= 1) {
						const optionId = x[0].option_id;

						const opt2 = selectFunction(
							"select * from ec_option_value where option_id = '"
								.concat(`${optionId}`)
								.concat("'")
						);

						request(opt2, async (error, response) => {
							if (error) throw new Error(error);
							else {
								let y = JSON.parse(response.body);

								// console.log(y);

								if (y.length > 1) {
									const opt3 = deleteFunction(
										"delete from ec_option_value where id = '"
											.concat(`${oid}`)
											.concat("'"),
										"null"
									);

									request(opt3, async (error, response) => {
										if (error) throw new Error(error);
										else {
											// let z = JSON.parse(response.body);

											// console.log(z);

											return res.redirect(`/v1/editOptions/${pid}`);
										}
									})
								}

								else if (y.length == 1) {
									const opt4 = deleteFunction(
										"delete from ec_option_value where id = '"
											.concat(`${oid}`)
											.concat("'"),
										"null"
									);

									request(opt4, async (error, response) => {
										if (error) throw new Error(error);
										else {
											return res.redirect(`/v1/editOptions/${pid}`);
										}
									})
								}

								else {
									return res.redirect(`/v1/editOptions/${pid}`);
								}
							}
						})
					}

					else {
						return res.redirect(`/v1/editOptions/${pid}`);
					}
				}
			})
		}

	}
	catch(error) {
		console.log(error);
		return res.redirect('/v1/products');
	}
})

router.post("/editOptions",
	[
		body('warranty')
      .trim()
      .notEmpty()
      .withMessage('Please Select a valid warranty Value')
      .isIn(['Garantie', 'Abonnement', 'Options', 'Option'])
      .withMessage('Select valid Options'),
    body('affect_price')
      .trim()
      .notEmpty()
      .withMessage('Option Price required')
      .isFloat({ min: 0, max: 1000 })
      .withMessage('Option Price must be an integer between 0 and 1000'),
    body('optValue')
      .trim()
      .notEmpty()
    	//.isIn(['1 Mois', '12 Mois', 'à VIE', 'à VIE + Privé', 'Solo', 'Duo', 'Tribu', 'Pack Standard', 'Pack Premium', 'Partager', '100% Privé'])
      .withMessage('Invalid Options Value')
      .matches(/^[^@#$%&*]+$/)
      .withMessage('Only Characters with white space and numbers are allowed'),
	],
 	async (req, res, next) => {
		try {
			// console.log(req.body);

			const { pid2, warranty, affect_price, optValue } = req.body;

			const error = validationResult(req);

	    if (!error.isEmpty()) {
	      // console.log(error.array()[0].msg);
	      return res.render("user/editOptions", {
					title: "Edit Options",
					errorMessage: error.array()[0].msg,
					warranty: warranty,
					optValue: optValue,
					affect_price: affect_price,
					optionId: oid2,
					oldInput: {
						id: pid2,
					}
				});
	    }

			else {
				const opt1 = selectFunction(
					`select id FROM ec_options where product_id = ${pid2} limit 10 offset 0`
				);

				request(opt1, function (error, response) {
					if (error) throw new Error(error);
					else {
						// console.log(response.body);

						let z = JSON.parse(response.body);

						// console.log(z);

						if (z.length >= 1) {
							const opt2 = deleteFunction(
								"DELETE FROM `ec_option_value` WHERE option_id = '"
									.concat(`${z[0].id}`)
									.concat("'"),
								"select * from ec_option_value where option_id = '"
									.concat(`${z[0].id}`)
									.concat("'")
							);

							request(opt2, function (error, response) {
								if (error) throw new Error(error);
								else {
									// console.log(response.body);

									let z1 = JSON.parse(response.body);

									// console.log(z1, z1 == '');

									if (z1 == '') {
										const opt3 = deleteFunction(
											"DELETE FROM `ec_options` WHERE id = '"
												.concat(`${z[0].id}`)
												.concat("'"),
											"select * from ec_options where id = '"
												.concat(`${z[0].id}`)
												.concat("'")
										);

										request(opt3, function (error, response) {
											if (error) throw new Error(error);
											else {
												// console.log(response.body);

												let z5 = JSON.parse(response.body);

												// console.log(z5, z5 == '');

												if (z5 == '') {
													const currentDate = new Date();

													const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

													// console.log(formattedDate);

													const value4 = `\'${warranty}', \'null\', \'${pid2}\', \'0\', \'1\', \'${formattedDate}\', \'${formattedDate}\'`;

													const opt6 = insertFunction(
														"INSERT INTO ec_options(name, option_type, product_id, `order`, required, created_at, updated_at) VALUES ("
															.concat(`${value4}`)
															.concat(")"),
														"select * from ec_options where product_id = "
															.concat(`${pid2}`)
															.concat(" order by id desc limit 10 offset 0 ")
													);

													request(opt6, function (error, response) {
														if (error) throw new Error(error);
														else {
															// console.log(response.body);

															let z2 = JSON.parse(response.body);

															// console.log(z2);

															if (z2.length >= 1 && optValue) {
																const id2 = z2[0].id;
																// console.log(id2);

																const optionValues = [];
									                      
									              if (typeof optValue == 'object' && typeof affect_price == 'object') {
									                optValue.forEach((val, index) => {
									                  optionValues.push({
									                    value: val,
									                    affectPrice: affect_price[index], order: '0', affectType: '0'
									                  })
									                })
									              }

									              else {
									                optionValues.push({
																		value: optValue,
																		affectPrice: affect_price, order: '0', affectType: '0'
																	})
									              }

																// console.log(optionValues);

																// Generate the SQL query
																const sqlQuery = `INSERT INTO ec_option_value (option_id, option_value, affect_price, \`order\`, affect_type, created_at, updated_at) VALUES 
																	${optionValues.map(({ value, affectPrice, order, affectType }) => `('${id2}', '${value}', '${affectPrice}', '${order}', '${affectType}', '${formattedDate}', '${formattedDate}')`).join(', ')};`;

																const opt7 = insertFunction(
																	sqlQuery,
																	"select * from ec_option_value where option_id = "
																		.concat(`${id2}`)
																		.concat(" order by id desc limit 10 offset 0")
																);

																request(opt7, function (error, response) {
																	if (error) {
																		throw new Error(error);
																	} else {
																		// console.log(response.body);
																		let z3 = JSON.parse(response.body);
																		// console.log(z3);
																	}
																});

																return res.redirect(`/v1/edit-product/${pid2}`);
															}
														}
													})
												}

												else {
													return res.redirect(`/v1/editOptions/${pid2}`);
												}
											}
										})
									}

									else {
										return res.redirect(`/v1/editOptions/${pid2}`);
									}
								}
							})

						}
						else {
							return res.redirect(`/v1/editOptions/${pid2}`);
						}
					}
				})
			}
		}
		catch(error) {
			console.log(error);
			return res.redirect('/v1/products');
		}
})

router.post("/deleteProduct", isAuth, (req, res, next) => {
	try {
		const { product_id } = req.body;

		// console.log(product_id);

		let opt1 = deleteFunction(
			"delete from ec_products where id = '"
				.concat(`${product_id}`)
				.concat("'"),
			"select * from ec_products limit 10 offset 0"
		);

		// console.log(opt1);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
			else {
				const opt2 = deleteFunction(
					"delete from ec_product_collection_products where product_id = '"
						.concat(`${product_id}`)
						.concat("'"),
					"select * from ec_product_collection_products limit 10 offset 0"
				);

				request(opt2, async (error, response) => {
					if (error) throw new Error(error);
					else {
			    }
				})

				const opt3 = deleteFunction(
					"delete from ec_product_label_products where product_id = '"
						.concat(`${product_id}`)
						.concat("'"),
					"select * from ec_product_label_products limit 10 offset 0"
				);

				request(opt3, async (error, response) => {
					if (error) throw new Error(error);
					else {
					}
				})

				const opt4 = deleteFunction(
					"delete from ec_product_category_product where product_id = '"
						.concat(`${product_id}`)
						.concat("'"),
					"select * from ec_product_category_product limit 10 offset 0"
				);

				request(opt4, async (error, response) => {
					if (error) throw new Error(error);
					else {
					}
				})

				return res.redirect('/v1/products');
			}
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect('/v1/products');
	}
})

router.post("/deleteOrder", isAuth, (req, res, next) => {
	try {
		const { product_id } = req.body;

		// console.log(product_id);

		let opt1 = deleteFunction(
			"delete from ec_orders where id = '"
				.concat(`${product_id}`)
				.concat("'"),
			"select * from ec_orders where id = '"
				.concat(`${product_id}`)
				.concat("'")
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
	    else {
	    	let x = JSON.parse(response.body);

	    	// console.log(x);

	    	if (x.length == 0) {
		    	return res.redirect('/v1/orders');
		    }

		    else {
					req.flash('error', 'Failed to delete order...');
		    	return res.redirect('/v1/orders');
		    }
	    }
	  })
	}
	catch(error) {
		console.log(error);
		return res.redirect('/v1/orders');
	}
})

router.get("/editOrder/:id", isAuth, (req, res, next) => {
	try {
		const { id } = req.params;

		// console.log(id);

		let opt1 = selectFunction(
			`select ec_orders.id as pid, ec_orders.user_id, ec_orders.status, ec_orders.amount, ec_orders.discount_amount, ec_orders.sub_total, ec_orders.shipping_amount, ec_orders.token, ec_customers.name as customer, ec_customers.email, hCart.product_id, hCart.quantity, ec_products.name, ec_products.price, ec_products.image from ec_orders left join ec_customers on ec_orders.user_id = ec_customers.id left join hCart on hCart.email = ec_customers.email left join ec_products on ec_products.id = hCart.product_id where ec_orders.id = ${id}`
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
	    else {
	      let x = await JSON.parse(response.body);

	      // console.log(x[0]);

	      return res.render("user/edit_orders", {
					title: 'Orders Edit',
					errorMessage: '',
					data: x,
				})
	    }
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/orders");
	}
})

router.get("/categories", isAuth, (req, res, next) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const itemsPerPage = 10;

		let offset = 0;

		if (page == 1) {
			offset = 0;
		}
		else {
			offset = 10 * (page - 1);
		}

		let opt1 = selectFunction(
			`select * from ec_product_categories limit 10 offset ${offset}`
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
	    else {
	    	const x = await JSON.parse(response.body);

	    	// console.log(x);

	    	if (x.length >= 1) {
	    		let opt2 = selectFunction("select COUNT(*) as cLength from ec_product_categories");

					request(opt2, async (error, response) => {
						if (error) throw new Error(error);
						else {
							let y = JSON.parse(response.body);
							// console.log(y);

							if (y.length >= 1) {
								const totalCount = y[0].cLength;
					 			let pageCount = Math.ceil(totalCount / itemsPerPage);

					 			if (pageCount == 1) { pageCount = 0; }

					 			// console.log(pageCount);

					 			return res.render("user/categories", {
					    		title: 'Categories',
					    		data: x,
									currentPage: page,
									pageCount: pageCount
					    	});
					 		}

					 		else {
					 			return res.render("user/categories", {
					    		title: 'Categories',
					    		data: x,
									currentPage: page,
									pageCount: 0
					    	});
					 		}
					 	}
					})
		    }

		    else {
		    	return res.render("user/categories", {
		    		title: 'Categories',
		    		data: [],
						currentPage: page,
						pageCount: 0
		    	});
		    }
	    }
	  })
	}
	catch(error) {
		return res.redirect("/v1/products");
	}
})

router.get("/customers", isAuth, (req, res, next) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const itemsPerPage = 10;

		let offset = 0;

		if (page == 1) {
			offset = 0;
		}
		else {
			offset = 10 * (page - 1);
		}

		let opt1 = selectFunction(
			`select * from ec_customers limit 10 offset ${offset}`
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = await JSON.parse(response.body);

				// console.log(x);

				if (x.length >= 1) {
					let opt2 = selectFunction("select COUNT(*) as cLength from ec_customers");

					request(opt2, async (error, response) => {
						if (error) throw new Error(error);
						else {
							let y = JSON.parse(response.body);
							// console.log(y);

							if (y.length >= 1) {
								const totalCount = y[0].cLength;
					 			const pageCount = Math.ceil(totalCount / itemsPerPage);

					 			return res.render("user/customers", {
									title: 'Customers',
									data: x,
									currentPage: page,
									pageCount: pageCount
								})
					 		}

					 		else {
					 			return res.render("user/customers", {
									title: 'Customers',
									data: x,
									currentPage: page,
									pageCount: 0
								})
					 		}
						}
					})
				}

				else {
					return res.render("user/customers", {
						title: 'Customers',
						data: [],
						currentPage: page,
						pageCount: 0
					})
				}
			}
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/products");
	}
})

router.get("/editCustomers/:id", isAuth, (req, res, next) => {
	try {
		const { id } = req.params;

		// console.log(id);

		let opt1 = selectFunction(
			"select * from ec_customers where id = '"
				.concat(`${id}`)
				.concat("' limit 10 offset 0")
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
	    else {
	     	let x = await JSON.parse(response.body);

	     	// console.log(x);

	     	return res.render("user/edit_customers", {
	     		title: 'Customers Edit',
					errorMessage: '',
					data: x,
	     	})
	    }
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/categories");
	}
})

router.post("/postEditCustomers", isAuth, (req, res, next) => {
	try {
		// console.log(req.body);

		const {name, email, password, phone, dob, status, product_id} = req.body;

		let opt1 = '';

		if (password !== '') {
			opt1 = updateFunction(
				"UPDATE ec_customers set name = '"
					.concat(`${name}`)
					.concat("', email = '")
					.concat(`${email}`)
					.concat("', phone = '")
					.concat(`${phone}`)
					.concat("', dob = '")
					.concat(`${dob}`)
					.concat("', password = '")
					.concat(`${password}`)
					.concat("' where id = '")
					.concat(`${product_id}`)
					.concat("'"),
				"select * from ec_customers where id = '"
	      	.concat(`${product_id}`)
	      	.concat("' limit 10 offset 0")
			);
		}

		else {
			opt1 = updateFunction(
				"UPDATE ec_customers set name = '"
					.concat(`${name}`)
					.concat("', email = '")
					.concat(`${email}`)
					.concat("', phone = '")
					.concat(`${phone}`)
					.concat("', dob = '")
					.concat(`${dob}`)
					.concat("' where id = '")
					.concat(`${product_id}`)
					.concat("'"),
				"select * from ec_customers where id = '"
	      	.concat(`${product_id}`)
	      	.concat("' limit 10 offset 0")
			);
		}

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
      else {
        let x = JSON.parse(response.body);

        // console.log(x);

        if (x.length >= 1) {
        	return res.redirect("/v1/customers");
        }

        else {
					req.flash('error', 'Failed to update customer...');
        	return res.redirect("/v1/customers");
        }
      }
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/customers");
	}
})

router.get("/editCategories/:id", isAuth, (req, res, next) => {
	try {
		const { id } = req.params;

		// console.log(id);

		let opt1 = selectFunction(
			"select * from ec_product_categories where id = '"
				.concat(`${id}`)
				.concat("' limit 10 offset 0")
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
	    else {
	     	let x = await JSON.parse(response.body);

	     	// console.log(x);

	     	if (x.length == 1) {
		     	return res.render("user/edit_categories", {
		     		title: "Categories Edit",
		     		data: x,
		     		errorMessage: ''
		     	})
		    }
		    else {
		    	return res.redirect("/v1/categories");
		    }
	    }
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/categories");
	}
})

router.post("/postEditCategories", isAuth, (req, res, next) => {
	try {
		// console.log(req.body);

		const { name, parent_id, status, order, product_id } = req.body;
    
    const currentDate = new Date();

		const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

		// console.log(formattedDate);

		let opt1 = updateFunction(
			"UPDATE ec_product_categories set name = '"
				.concat(`${name}`)
				.concat("' where id = '")
				.concat(`${product_id}`)
				.concat("'"),
			"select * from ec_product_categories where id = '"
				.concat(`${product_id}`)
				.concat("'")
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = JSON.parse(response.body);

				if (x.length == 1) {
					return res.redirect("/v1/categories");
				}

				else {
					// some error msg
					return res.redirect("/v1/categories");
				}
			}
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/categories");
	}
})

router.post("/deleteCustomers", isAuth, (req, res, next) => {
	try {
		const { product_id } = req.body;

		// console.log(product_id);

		let opt1 = deleteFunction(
			"delete from ec_customers where id = '"
				.concat(`${product_id}`)
				.concat("'"),
			"select * from ec_customers where id = '"
				.concat(`${product_id}`)
				.concat("'")
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
	   	else {
	    	let x = JSON.parse(response.body);

	    	// console.log(x);

	    	if (x.length == 0) {
		    	return res.redirect('/v1/customers');
		    }

		    else {
					req.flash('error', 'Failed to delete customer...');
		    	return res.redirect('/v1/customers');
		    }
	    }
	  })
	}
	catch(error) {
		console.log(error);
		return res.redirect('/v1/home');
	}
})

router.post("/deleteCategories", isAuth, (req, res, next) => {
	try {
		const { product_id } = req.body;

		// console.log(product_id);

		let opt1 = deleteFunction(
			"delete from ec_product_categories where id = '"
				.concat(`${product_id}`)
				.concat("'"),
			"select * from ec_product_categories where id = '"
				.concat(`${product_id}`)
				.concat("'")
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
	    else {
	    	let x = JSON.parse(response.body);

	    	// console.log(x);

	    	if (x.length == 0) {
		    	return res.redirect('/v1/categories');
		    }

		    else {
					req.flash('error', 'Failed to delete category...');
		    	return res.redirect('/v1/categories');
		    }
	    }
	  })
	}
	catch(error) {
		console.log(error);
		return res.redirect('/v1/home');
	}
})

router.get("/labels", isAuth, (req, res, next) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const itemsPerPage = 10;

		let offset = 0;

		if (page == 1) {
			offset = 0;
		}
		else {
			offset = 10 * (page - 1);
		}

		let message = req.flash('error');
		// console.log(message);

		if (message.length > 0) {
			message = message[0];
		}
		else {
			message = null;
		}

		let opt1 = selectFunction(
			`select * from ec_product_labels limit 10 offset ${offset}`
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = await JSON.parse(response.body);

				// console.log(x);

				if (x.length >= 1) {
					let opt2 = selectFunction("select COUNT(*) as cLength from ec_product_labels");

					request(opt2, async (error, response) => {
						if (error) throw new Error(error);
						else {
							let y = JSON.parse(response.body);
							// console.log(y);

							if (y.length >= 1) {
								const totalCount = y[0].cLength;
					 			let pageCount = Math.ceil(totalCount / itemsPerPage);

					 			if (pageCount == 1) { pageCount = 0; }

					 			// console.log(pageCount);

					 			return res.render("user/labels", {
					    		title: 'Labels',
					    		data: x,
									currentPage: page,
									pageCount: pageCount,
									errorMessage: message,
					    	});
					 		}

					 		else {
					 			return res.render("user/labels", {
					    		title: 'Labels',
					    		data: x,
									currentPage: page,
									pageCount: 0,
									errorMessage: message,
					    	});
					 		}
					 	}
					})
				}

				else {
					return res.render("user/labels", {
		    		title: 'Labels',
		    		data: [],
						currentPage: page,
						pageCount: 0,
						errorMessage: message
		    	});
				}
			}
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/home");
	}
})

router.get("/editLabels/:id", isAuth, (req, res, next) => {
	try {
		const { id } = req.params;

		let message = req.flash('error');
		// console.log(message);

		if (message.length > 0) {
			message = message[0];
		}
		else {
			message = null;
		}

		// console.log(id);

		let opt1 = selectFunction(
			"select * from ec_product_labels where id = '"
				.concat(`${id}`)
				.concat("' limit 10 offset 0")
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
	    else {
	     	let x = await JSON.parse(response.body);

	     	// console.log(x);

	     	if (x.length == 1) {
		     	return res.render("user/edit_labels", {
		     		title: "Labels Edit",
		     		data: x,
		     		errorMessage: ''
		     	})
		    }
		    else {
					req.flash('error', 'Failed, try again...');
		    	return res.redirect("/v1/labels");
		    }
	    }
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/home");
	}
})

router.post("/postEditLabels", isAuth, (req, res, next) => {
	try {
		// console.log(req.body);
		const { id, status, created_at, updated_at, product_id } = req.body;

		let name = req.body.name;
		if (name == 'PROMO🎁') {
			name = 'PROMO?';
		} else if (name == 'Populaire🔥') {
			name = 'Populaire?';
		} else {
			name = name;
		}
    
    const currentDate = new Date();

		const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

		// console.log(formattedDate, name);

		let opt1 = updateFunction(
			"UPDATE ec_product_labels set name = '"
				.concat(`${name}`)
				.concat("', updated_at = '")
				.concat(`${formattedDate}`)
				.concat("' where id = '")
				.concat(`${product_id}`)
				.concat("'"),
			"select * from ec_product_labels where id = '"
				.concat(`${product_id}`)
				.concat("'")
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = JSON.parse(response.body);

				// console.log(x);

				if (x.length >= 1) {
					return res.redirect("/v1/labels");
				}

				else {
					return res.redirect(`/v1/editLabels/${id}`)
				}
			}
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/home");
	}
})

router.post("/deleteLabels", isAuth, (req, res, next) => {
	try {
		const { product_id } = req.body;

		// console.log(product_id);

		let opt1 = deleteFunction(
			"delete from ec_product_labels where id = '"
				.concat(`${product_id}`)
				.concat("'"),
			"select * from ec_product_labels where id = '"
				.concat(`${product_id}`)
				.concat("'")
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
	    else {
	    	let x = JSON.parse(response.body);

	    	// console.log(x);

	    	if (x.length == 0) {
		    	return res.redirect('/v1/labels');
		    }

		    else {
					req.flash('error', 'Failed to delete label...');
		    	return res.redirect('/v1/labels');
		    }
	    }
	  })
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/home");
	}
})

router.get("/faq", isAuth, (req, res, next) => {
	try {
		let message = req.flash('error');
		// console.log(message);

		if (message.length > 0) {
			message = message[0];
		}
		else {
			message = null;
		}

		return res.render("user/faqs", {
			title: 'Faqs',
			errorMessage: message
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/home");
	}
})

router.get("/faq/:lang", isAuth, (req, res, next) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const itemsPerPage = 10;

		let offset = 0;

		if (page == 1) {
			offset = 0;
		}
		else {
			offset = 10 * (page - 1);
		}

		let message = req.flash('error');
		// console.log(message);

		if (message.length > 0) {
			message = message[0];
		}
		else {
			message = null;
		}

		const { lang } = req.params;

		// console.log(lang);

		if (lang == 'fr') {
			let opt1 = selectFunction(
				"select * from faqs limit 10 offset 0"
			);

			request(opt1, async (error, response) => {
				if (error) throw new Error(error);
				else {
					let x = await JSON.parse(response.body);

					// console.log(x);

					if (x.length >= 1) {
						let opt2 = selectFunction("select COUNT(*) as cLength from faqs");

						request(opt2, async (error, response) => {
							if (error) throw new Error(error);
							else {
								let y = JSON.parse(response.body);
								// console.log(y);

								if (y.length >= 1) {
									const totalCount = y[0].cLength;
						 			let pageCount = Math.ceil(totalCount / itemsPerPage);

						 			if (pageCount == 1) { pageCount = 0; }

						 			// console.log(pageCount);

						 			return res.render("user/faq", {
										title: "faqs",
										data: x,
										lang: lang,
										currentPage: page,
										pageCount: pageCount,
										errorMessage: message
									})
						 		}

						 		else {
						 			return res.render("user/faq", {
										title: "faqs",
										data: x,
										lang: lang,
										currentPage: page,
										pageCount: 0,
										errorMessage: message
									})
						 		}
						 	}
						})
					}

					else {
						return res.render("user/faq", {
							title: "faqs",
							data: [],
							lang: lang,
							currentPage: page,
							pageCount: 0,
							errorMessage: message
						})
					}
				}
			})
		}

		else if (lang == 'en_US') {
			let opt3 = selectFunction("select * from faqs_translations limit 10 offset 0");

			request(opt3, async (error, response) => {
				if (error) throw new Error(error);
				else {
					let x = JSON.parse(response.body);

					// console.log(x);

					if (x.length >= 1) {
						let opt4 = selectFunction("select COUNT(*) as cLength from faqs_translations");

						request(opt4, async (error, response) => {
							if (error) throw new Error(error);
							else {
								let y = JSON.parse(response.body);
								// console.log(y);

								if (y.length >= 1) {
									const totalCount = y[0].cLength;
						 			let pageCount = Math.ceil(totalCount / itemsPerPage);

						 			if (pageCount == 1) { pageCount = 0; }

						 			// console.log(pageCount);

						 			return res.render("user/faq", {
										title: "faqs",
										data: x,
										lang: lang,
										currentPage: page,
										pageCount: pageCount,
										errorMessage: message
									})
						 		}

						 		else {
						 			return res.render("user/faq", {
										title: "faqs",
										data: x,
										lang: lang,
										currentPage: page,
										pageCount: 0,
										errorMessage: message
									})
						 		}
						 	}
						})
					}

					else {
						return res.render("user/faq", {
							title: "faqs",
							data: [],
							lang: lang,
							currentPage: page,
							pageCount: 0,
							errorMessage: message
						})
					}
				}
			})
		}
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/home");
	}
})

router.get("/editFaq/:id", isAuth, (req, res, next) => {
	try {
		const { id } = req.params;
		const { lang } = req.query;

		let opt1 = '';

		// console.log(id, lang);

		let message = req.flash('error');
		// console.log(message);

		if (message.length > 0) {
			message = message[0];
		}
		else {
			message = null;
		}

		if (lang == 'fr') {
			opt1 = selectFunction(
				`select * from faqs where id = ${id}`
			);
		}

		else if (lang == 'en_US') {
			opt1 = selectFunction(
				`select * from faqs_translations where faqs_id = ${id}`
			);
		}

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = await JSON.parse(response.body);

				// console.log(x);

				return res.render("user/edit_faqs", {
					title: 'Faqs Edit',
					data: x,
					lang: lang,
					errorMessage: message
				})
			}
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/home");
	}
})

router.post("/postEditFaqs", isAuth, (req, res, next) => {
	try {
		// console.log(req.body);

		const { id, question, answer, status, lang, product_id } = req.body;
    
    let opt1 = '';

		const formattedDescription1 = `<p>${question}</p>`;
		const formattedDescription2 = `<p>${answer}</p>`;

		// console.log(formattedDescription1, formattedDescription2);

		if (lang == 'fr') {
			opt1 = updateFunction(
				'UPDATE faqs set question = "'
					.concat(`${formattedDescription1}`)
					.concat('", answer = "')
					.concat(`${formattedDescription2}`)
					.concat('" where id = "')
					.concat(`${product_id}`)
					.concat('"'),
				"select * from faqs where id = '"
					.concat(`${product_id}`)
					.concat("'")
			);
		}

		else if (lang == 'en_US') {
			opt1 = updateFunction(
				'UPDATE faqs_translations set question = "'
					.concat(`${formattedDescription1}`)
					.concat('", answer = "')
					.concat(`${formattedDescription2}`)
					.concat('" where faqs_id = "')
					.concat(`${product_id}`)
					.concat('"'),
				"select * from faqs_translations where faqs_id = '"
					.concat(`${product_id}`)
					.concat("'")
			);
		}

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = await JSON.parse(response.body);

				// console.log(x);

				if (x.length == 1) {
					return res.redirect(`/v1/faq/${lang}`);
				}

				else {
					req.flash('error', 'Failed to update, try again...');
					return res.redirect(`/v1/faq/${lang}`);
				}
			}
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/home");
	}
})

router.get("/addFaq", isAuth, (req, res, next) => {
	try {
		let message = req.flash('error');
		// console.log(message);

		if (message.length > 0) {
			message = message[0];
		}
		else {
			message = null;
		}

		return res.render("user/add_faq", {
			title: 'Add FAQ',
			errorMessage: message
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/home");
	}
})

router.post("/postAddFaq", isAuth, (req, res, next) => {
	try {
		// console.log(req.body);

		const { question, answer, lang } = req.body;

		if (lang == 'fr') {
			let opt2 = selectFunction(
				"SELECT `AUTO_INCREMENT` FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'bhav_h4kig_db' AND TABLE_NAME = 'faqs'"
			);

			request(opt2, async (error, response) => {
				if (error) throw new Error(error);
				else {
					let x = JSON.parse(response.body);

					if (x.length >= 1) {
						const { AUTO_INCREMENT } = x[0];
						// console.log(AUTO_INCREMENT);

// 						const currentDate = new Date();
// 						const year = currentDate.getFullYear();
// 						const month = String(currentDate.getMonth() + 1).padStart(2, '0');
// 						const day = String(currentDate.getDate()).padStart(2, '0');
// 						const hours = String(currentDate.getHours()).padStart(2, '0');
// 						const minutes = String(currentDate.getMinutes()).padStart(2, '0');
// 						const seconds = String(currentDate.getSeconds()).padStart(2, '0');

// 						const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            
            const currentDate = new Date();

				    const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

						// console.log(formattedDate, name);

						const formattedDescription1 = `<p>${question}</p>`;
						const formattedDescription2 = `<p>${answer}</p>`;

						let value1 = `\'${formattedDescription1}\', \'${formattedDescription2}\', \'${AUTO_INCREMENT}\', \'1\', \'published\', \'${formattedDate}\', \'${formattedDate}\'`;

						const opt1 = insertFunction(
							"insert into faqs (question, answer, faqs_id, category_id, status, created_at, updated_at) values ("
								.concat(`${value1}`)
								.concat(")"),
							"select * from faqs where id = '"
								.concat(`${AUTO_INCREMENT}`)
								.concat("'")
						);

						request(opt1, async (error, response) => {
							if (error) throw new Error(error);
							else {
								let y = JSON.parse(response.body);

								// console.log(y);

								return res.redirect(`/v1/faq/${lang}`);
							}
						})
					}
				}
			})
		}

		else if (lang == 'en_US') {
			let opt3 = selectFunction(
				"select MAX(faqs_id) from faqs_translations"
			);

			request(opt3, async (error, response) => {
				if (error) throw new Error(error);
				else {
					let z = JSON.parse(response.body);

					const ai = parseInt(z[0]['MAX(faqs_id)'])+1;

					// console.log(ai);

					if (z.length >= 1) {
						const formattedDescription1 = `<p>${question}</p>`;
						const formattedDescription2 = `<p>${answer}</p>`;

						const value2 = `\'${lang}\', \'${ai}\', \'${formattedDescription1}\', \'${formattedDescription2}\'`;

						let opt4 = insertFunction(
							"insert into faqs_translations (lang_code, faqs_id, question, answer) values ("
								.concat(`${value2}`)
								.concat(")"),
							"select * from faqs_translations where faqs_id = '"
								.concat(`${ai}`)
								.concat("'")
						);

						request(opt4, async (error, response) => {
							if (error) throw new Error(error);
							else {
								let y = JSON.parse(response.body);

								// console.log(y);

								return res.redirect(`/v1/faq/${lang}`);
							}
						})
					}
				}
			})
		}
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/home");
	}
})

router.post("/deleteFaq", isAuth, (req, res, next) => {
	try {
		const { product_id, lang } = req.body;

		// console.log(product_id, lang);

		let opt1 = '';

		if (lang == 'fr') {
			opt1 = deleteFunction(
				"delete from faqs where id = '"
					.concat(`${product_id}`)
					.concat("'"),
				"select * from faqs where id = '"
					.concat(`${product_id}`)
					.concat("'")
			);
		}

		else if (lang == 'en_US') {
			opt1 = deleteFunction(
				"delete from faqs_translations where faqs_id = '"
					.concat(`${product_id}`)
					.concat("'"),
				"select * from faqs_translations where faqs_id = '"
					.concat(`${product_id}`)
					.concat("'")
			);
		}

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
	    else {
	    	let x = JSON.parse(response.body);

	    	// console.log(x);

	    	if (x.length == 0) {
		    	return res.redirect('/v1/faq');
		    }

		    else {
					req.flash('error', 'Failed to delete FAQ...');
		    	return res.redirect('/v1/faq');
		    }
	    }
	  })		
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/home");
	}
})

router.get("/newsletter", isAuth, (req, res, next) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const itemsPerPage = 10;

		let offset = 0;

		if (page == 1) {
			offset = 0;
		}
		else {
			offset = 10 * (page - 1);
		}

		let message = req.flash('error');
		// console.log(message);

		if (message.length > 0) {
			message = message[0];
		}
		else {
			message = null;
		}

		let opt1 = selectFunction(
			`select * from newsletters order by created_at desc limit 10 offset ${offset}`
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = JSON.parse(response.body);

				// console.log(x);

				if (x.length >= 1) {
					let opt2 = selectFunction("select COUNT(*) as oLength from newsletters");

					request(opt2, async (error, response) => {
						if (error) throw new Error(error);
						else {
							let y = JSON.parse(response.body);
							// console.log(y);

							if (y.length >= 1) {
								const totalCount = y[0].oLength;
					 			const pageCount = Math.ceil(totalCount / itemsPerPage);

					 			return res.render("user/newsletter", {
									title: 'Newsletters',
									data: x,
									currentPage: page,
									pageCount: pageCount,
									errorMessage: message
								})
					 		}

					 		else {
					 			return res.render("user/newsletter", {
									title: 'Newsletters',
									data: x,
									currentPage: page,
									pageCount: 0,
									errorMessage: message
								})
					 		}
						}
					})
				}

				else {
					return res.render("user/newsletter", {
						title: 'Newsletters',
						data: [],
						currentPage: page,
						pageCount: 0,
						errorMessage: message
					})
				}
			}
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/home");
	}
})

router.post("/deleteNewsletter", isAuth, (req, res, next) => {
	try {
		const { product_id } = req.body;

		// console.log(product_id);

		let opt1 = deleteFunction(
			"delete from newsletters where id = '"
				.concat(`${product_id}`)
				.concat("'"),
			"select * from newsletters where id = '"
				.concat(`${product_id}`)
				.concat("'")
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
	    else {
	    	let x = JSON.parse(response.body);

	    	// console.log(x);

	    	if (x.length == 0) {
		    	return res.redirect('/v1/newsletter');
		    }

		    else {
					req.flash('error', 'Failed to delete subscriber...');
		    	return res.redirect('/v1/newsletter');
		    }
	    }
	  })
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/home");
	}
})

router.get("/payments", isAuth, (req, res, next) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const itemsPerPage = 10;

		let offset = 0;

		if (page == 1) {
			offset = 0;
		}
		else {
			offset = 10 * (page - 1);
		}

		let message = req.flash('error');
		// console.log(message);

		if (message.length > 0) {
			message = message[0];
		}
		else {
			message = null;
		}

		// let opt1 = selectFunction(
		// 	`select hCart.product_id as id, hCart.quantity, ec_products.price, ec_products.name, ec_products.image from ec_orders left join ec_customers on ec_orders.user_id = ec_customers.id  left join hCart on ec_customers.email = hCart.email left join ec_products on ec_products.id = hCart.product_id limit 10 offset ${offset}`
		// );

		let opt1 = selectFunction(
			`select payments.id, payments.charge_id, payments.amount, payments.payment_channel, payments.status, payments.created_at, ec_customers.name from payments left join ec_customers on ec_customers.id = payments.customer_id ORDER BY id DESC limit 10 offset ${offset}`
		)

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = await JSON.parse(response.body);

				// console.log(x);
				if (x.length >= 1) {
					let opt2 = selectFunction("select COUNT(*) as oLength from payments");

					request(opt2, async (error, response) => {
						if (error) throw new Error(error);
						else {
							let y = JSON.parse(response.body);
							// console.log(y);

							if (y.length >= 1) {
								const totalCount = y[0].oLength;
					 			const pageCount = Math.ceil(totalCount / itemsPerPage);

					 			return res.render("user/payments", {
									title: 'Payments',
									data: x,
									currentPage: page,
									pageCount: pageCount,
									errorMessage: message
								})
					 		}

					 		else {
					 			return res.render("user/payments", {
									title: 'Payments',
									data: x,
									currentPage: page,
									pageCount: 0,
									errorMessage: message
								})
					 		}
						}
					})
				}
				else {
					return res.render("user/payments", {
						title: 'Payments',
						data: [],
						currentPage: page,
						pageCount: 0,
						errorMessage: message
					})
				}
			}
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/home");
	}
})

router.post("/deletePayments", isAuth, (req, res, next) => {
	try {
		const { product_id } = req.body;

		// console.log(product_id);

		let opt1 = deleteFunction(
			"delete from payments where id = '"
				.concat(`${product_id}`)
				.concat("'"),
			"select * from payments where id = '"
				.concat(`${product_id}`)
				.concat("'")
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
	    else {
	    	let x = JSON.parse(response.body);

	    	// console.log(x);

	    	if (x.length == 0) {
		    	return res.redirect('/v1/payments');
		    }

		    else {
					req.flash('error', 'Failed to delete subscriber...');
		    	return res.redirect('/v1/payments');
		    }
	    }
	  })
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/home");
	}
})

router.get("/pages", isAuth, (req, res, next) => {
	try {
		return res.render("user/pages", {
			title: "Pages",
			errorMessage: ''
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect("/");
	}
})

router.get("/contactUs", isAuth, (req, res, next) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const itemsPerPage = 10;

		let offset = 0;

		if (page == 1) {
			offset = 0;
		}
		else {
			offset = 10 * (page - 1);
		}

		let message = req.flash('error');
		// console.log(message);

		if (message.length > 0) {
			message = message[0];
		}
		else {
			message = null;
		}

		const opt1 = selectFunction(
			`SELECT * FROM contacts ORDER BY id DESC limit 10 offset ${offset}`
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = await JSON.parse(response.body);

				// console.log(x);

				if (x.length >= 1) {
					const opt2 = selectFunction("select COUNT(*) as oLength from contacts");

					request(opt2, async (error, response) => {
						if (error) throw new Error(error);
						else {
							let y = JSON.parse(response.body);

							if (y.length >= 1) {
								const totalCount = y[0].oLength;
					 			const pageCount = Math.ceil(totalCount / itemsPerPage);

								return res.render("user/contactUs", {
									title: 'Contact Us',
									data: x,
									currentPage: page,
									pageCount: pageCount,
									errorMessage: message
								})
							}

							else {
								return res.render("user/contactUs", {
									title: 'Contact Us',
									data: x,
									currentPage: page,
									pageCount: 0,
									errorMessage: message
								})
							}
						}
					})
				}
				else {
					return res.render("user/contactUs", {
						title: 'Contact Us',
						data: [],
						currentPage: page,
						pageCount: 0,
						errorMessage: message
					})
				}
			}
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/home");
	}
})

router.get("/reply/:id", isAuth, (req, res, next) => {
	try {
		const { id } = req.params;
    
    // console.log(id);

		let message = req.flash('error');
		// console.log(message);

		if (message.length > 0) {
			message = message[0];
		}
		else {
			message = null;
		}

		const opt1 = selectFunction(
			"SELECT * FROM contacts where id = '"
				.concat(`${id}`)
				.concat("'")
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = await JSON.parse(response.body);
				// console.log(x);
        
        if(x.length >= 1) {
          // const status = x[0].status;
          
          if (x[0].status == 'unread') {
            return res.render("user/editContact", {
              title: "ContactUs Edit",
              data: x,
              answer: '',
              errorMessage: message
            })
          }
          else {
            const opt2 = selectFunction(
              "select message from contact_replies where contact_id = '"
                .concat(`${id}`)
                .concat("' order by id desc")
            )
            request(opt2, async (error, response) => {
              if (error) throw new Error(error);
              else {
                let y = await JSON.parse(response.body);
                // console.log(y);
                
                if (y.length >= 1) {
                  return res.render("user/editContact", {
                    title: "ContactUs Edit",
                    data: x,
                    answer: y[0].message,
                    errorMessage: message
                  })
                }
                
                else {
                  return res.render("user/editContact", {
                    title: "ContactUs Edit",
                    data: x,
                    answer: '',
                    errorMessage: message
                  })
                }
              }
            })
          }
        }
			}
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/home");
	}
})

router.post("/deleteContactUS", isAuth, (req, res, next) => {
	try {
		const { product_id } = req.body;

		// console.log(product_id);

		let opt1 = deleteFunction(
			"delete from contacts where id = '"
				.concat(`${product_id}`)
				.concat("'"),
			"select * from contacts where id = '"
				.concat(`${product_id}`)
				.concat("' limit 10 offset 0")
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
	    else {
	    	let x = JSON.parse(response.body);

	    	// console.log(x);

	    	if (x.length == 0) {
		    	return res.redirect('/v1/contactUs');
		    }

		    else {
					req.flash('error', 'Failed to delete message...');
		    	return res.redirect('/v1/contactUs');
		    }
	    }
	  })
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/home");
	}
})

router.post("/postReply", isAuth, (req, res, next) => {
  try {
    const { customerId, answer } = req.body;
    
    // console.log(req.body);
        
    const currentDate = new Date();

		const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

		// console.log(formattedDate, name);
    
    let value1 = `\'${answer}\', \'${customerId}\', \'${formattedDate}\', \'${formattedDate}\'`;
    
    const opt1 = insertFunction(
      "INSERT INTO contact_replies (`message`, `contact_id`, `created_at`, `updated_at`) VALUES ("
        .concat(`${value1}`)
        .concat(")"),
      "select * from contact_replies where contact_id = '"
        .concat(`${customerId}`)
        .concat("'")
    )
    
    request(opt1, async (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = await JSON.parse(response.body);

				// console.log(x);
        
        if (x.length >= 1) {
          const opt2 = selectFunction(
            "select * from contacts where id = '"
              .concat(`${customerId}`)
              .concat("'")
          )
          
          request(opt2, async (error, response) => {
						if (error) throw new Error(error);
						else {
							let y = await JSON.parse(response.body);

							// console.log(y); 
              
              if (y.length >= 1) {
                const email = y[0].email;
                
                const opt3 = {
                  method: "POST",
                  url: "https://bhaveshnetflix.live/sendMail.php",
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                  form: {
                    receiver: email,
                    subject: "Hi,",
                    msg: answer,
                  },
                };

                request(opt3, async (error, response) => {
                  if (error) throw new Error(error);
                  else {
                    let z = await response.body;
                    // console.log(y, typeof y);

                    if (z === "Sent") {
                      const opt4 = updateFunction(
                        "update contacts set status = 'read' where id = '"
                          .concat(`${customerId}`)
                          .concat("'"),
                        "select * from contacts where id = '"
                          .concat(`${customerId}`)
                          .concat("'")
                      )
                      
                      request(opt4, async (error, response) => {
                        if (error) throw new Error(error);
                        else {
                          let z1 = await JSON.parse(response.body);

                          // console.log(z1); 
                          
                          if (z1.length >= 1) {
                            return res.redirect("/v1/contactUs");                          
                          }
                          else {
                            return res.redirect("/v1/reply/<%= customerId %>");
                          }
                        }
                      })
                    }
                    
                    else {
                      return res.redirect("/v1/contactUs");
                    }
                  }
                })
              }
              else {
                return res.redirect("/v1/reply/<%= customerId %>");
              }
            }
          })
        }
        else {
          return res.redirect("/v1/reply/<%= customerId %>");
        }
      }
    })
  }
  
  catch(error) {
    console.log(error);
		return res.redirect("/v1/home");
  }
})

module.exports = router;
