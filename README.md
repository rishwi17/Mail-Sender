# Mail-Sender
<p>
 <li>Use the command : <strong> npm install  </strong> to install the dependencies</li>
<li> Use the command : <strong> npm run dev </strong> to run the project with nodemon</li>
</p>

<p>
<li>Use <strong>/getAuthCode</strong> GET request to start the authentication process and obtain an access and refresh token</li>
<li>The access and refresh tokens will be stored in respective files </li>
<li>Use <strong>/sendMail</strong> POST request along with the relevant body to send a mail</li>
<li>Use the following body structure for the POST request :<br>
{
    "reciever" : "rishwi.prakash@gmail.com",
    "subject" : "Some Subject",
    "message" : "Some Message"
	}

</li>

<li>
  use the <strong>/refreshAccessToken</strong> POST request to refresh an access token 
</li>

<li> use the <strong>/getAuthCode</strong> GET request again to get new tokens for a new sender </li>
</p>
