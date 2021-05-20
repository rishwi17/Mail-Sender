const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const fs = require("fs");
const open = require("open");
//CLIENT ID FOR OAUTH VERIFICATION
const CLIENT_ID =
	"756184026589-ctu3cj9iof5o0680drsb6sh5h91q20tc.apps.googleusercontent.com";
// CLIENT SECRET FOR OAUTH VERIFICATION
const CLIENT_SECRET = "NigMBD5vxyzVAEmqezWMSDSe";
//PERMISSION SCOPE TO SEND EMAIL
const SCOPE = "https://www.googleapis.com/auth/gmail.send";

app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(3000, () => console.log("App Running..."));

// REQUEST URL TO CALL TO OBTAIN AUTHENTICATION CODE
const authRequestString = `https://accounts.google.com/o/oauth2/v2/auth?
scope=${SCOPE}&
access_type=offline&
include_granted_scopes=true&
response_type=code&
state=state_parameter_passthrough_value&
redirect_uri=http://localhost:3000/getToken&
client_id=${CLIENT_ID}`;

//ROUTE TO TRIGGER THE AUTHENTICATION PROCESS
app.get("/getAuthCode", (req, res) => {
	//OPENS THE AUTH URL IN THE BROWSER
	open(authRequestString);
	res.send("Processed...");
});

//ROUTE TO OBTAIN THE ACCESS AND REFRESH TOKEN IN EXCHANGE OF THE AUTH CODE
app.get("/getToken", async (req, res) => {
	try {
		//EXTRACT THE AUTH CODE FROM THE URL
		var authCode = req.query.code;
		//SEND A POST REQUEST TO THE GOOGLE OAUTH API WITH THE AUTH CODE
		result = await axios.post(
			"https://oauth2.googleapis.com/token",
			{},
			{
				params: {
					client_id: CLIENT_ID,
					client_secret: CLIENT_SECRET,
					code: authCode,
					redirect_uri: "http://localhost:3000/getToken",
					grant_type: "authorization_code",
				},
			}
		);
		//STORE THE ACCESS TOKEN IN A TEXT FILE
		fs.writeFile("access_token.txt", result.data.access_token, (err) => {
			if (err) res.send(err);
		});
		// STORE THE REFRESH TOKEN IN A TEXT FILE
		fs.writeFile("refresh_token.txt", result.data.refresh_token, (err) => {
			if (err) res.send(err);
		});
		//SEND THE RESPONSE IN CASE OF SUCCESS
		res.send(
			"Access token created, you can now send your email using the /sendMail route"
		);
	} catch (err) {
		console.log(err);
	}
});
//ROUTE TO SEND THE EMAIL

/*
	SEND THE POST REQUEST ALONG WITH THE BODY IN THE FORMAT:

	{
    "reciever" : "rishwi.prakash@gmail.com",
    "subject" : "Some Subject",
    "message" : "Some Message"
	}

*/
app.post("/sendMail", async (req, res) => {
	try {
		//EXTRACT THE ACCESS_TOKEN FROM THE FILE
		var access_token = fs.readFileSync("access_token.txt").toString();

		//ENCODE THE EMAIL BODY
		var encodedMail = new Buffer.from(
			'Content-Type: text/plain; charset="UTF-8"\n' +
				"MIME-Version: 1.0\n" +
				"Content-Transfer-Encoding: 7bit\n" +
				//EXTRACT RECIEVER ADDRESS FROM THE BODY
				`to: ${req.body.reciever}\n` +
				"from: me\n" +
				//EXTRACT THE SUBJECT FROM THE BODY
				`subject: ${req.body.subject}\n\n` +
				//EXTRACT THE MESSAGE FROM THE BODY
				req.body.message
		)
			.toString("base64")
			.replace(/\+/g, "-")
			.replace(/\//g, "_");

		//SEND A POST REQUEST TO THE GMAIL API WITH THE MAIL DATA
		var mail = await axios.post(
			"https://www.googleapis.com/gmail/v1/users/me/messages/send",
			//RAW CONTAINS THE ENCODED MAIL
			{ raw: encodedMail },
			{
				// ATTACH THE ACCESS_TOKEN TO THE AUTHORIZTION HEADER
				headers: {
					Authorization: "Bearer " + access_token,
				},
			}
		);
		//SEND RESPONSE IN CASE OF SUCCESS
		res.send("Mail sent...");
	} catch (err) {
		res.send(
			"Invalid access token, please use the /getToken route to obtain a new access_token or the /refreshAccessToken route to refresh an access_token..."
		);
	}
});
//ROUTE TO REFRESH AN ACCESS TOKEN USING THE REFRESH TOKEN
app.post("/refreshAccessToken", async (req, res) => {
	try {
		//EXTRACT THE REFRESH TOKEN FROM THE FILE
		var refresh_token = fs.readFileSync("refresh_token.txt").toString();
		//MAKE A POST REQUEST TO THE GOOGLE OAUTH API WITH THE REFRESH TOKEN
		var result = await axios.post(
			"https://oauth2.googleapis.com/token",
			{},
			{
				params: {
					client_id: CLIENT_ID,
					client_secret: CLIENT_SECRET,
					grant_type: "refresh_token",
					refresh_token: refresh_token,
				},
			}
		);
		//OVERWRITE THE EXISTING ACCESS TOKEN WITH THE NEW ONE
		fs.writeFile("access_token.txt", result.data.access_token, (err) => {
			if (err) res.send(err);
		});
		//SEND RESPONSE IN CASE OF SUCCESS
		res.send("Token updated...");
	} catch (err) {
		console.log(err);
	}
});
