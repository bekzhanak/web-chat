import { Container } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { GoogleButton } from "react-google-button";
import './login.css';

const REACT_APP_GOOGLE_CLIENT_ID = "221906549886-rv3pq3ei43t6ok1rpjba8liiocrpart9.apps.googleusercontent.com";
const REACT_APP_BASE_BACKEND_URL = "http://localhost:8000"


const loginUser = async (e) => {
    e.preventDefault();
    let email = document.getElementById("email").value
    let password = document.getElementById("password").value
    await fetch("http://localhost:8000/api/login/", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            email,
            password
        })
    }).then((response) => {
        if (response.status !== 200) {
            alert("User not found or Incorrect password");
        }
        console.log(response.headers)
        return response.json()
    }).then((data) => {
        console.log(data)
        window.history.pushState({}, "main", "/");
        window.location.reload();
    });
}

const Login = () => {
    const openGoogleLoginPage = async () => {
        const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const redirectUri = 'api/login/google/';

        const scope = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ].join(' ');

        const params = {
            response_type: 'code',
            client_id: REACT_APP_GOOGLE_CLIENT_ID,
            redirect_uri: `${REACT_APP_BASE_BACKEND_URL}/${redirectUri}`,
            prompt: 'select_account',
            access_type: 'offline',
            scope
        };

        const urlParams = new URLSearchParams(params).toString();

        window.location = `${googleAuthUrl}?${urlParams}`;
    };

    return (
        <Container className='loginContainer'>
            <h1>Login Page</h1>
            <Form >
                <Form.Group className="mb-3" >
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" placeholder="Enter email" id="email" />
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" id="password" />
                </Form.Group>
                <Button className='loginButton' variant="primary" onClick={loginUser}>
                    Submit
                </Button>
            </Form>
            <div className='googleButton'>
                <GoogleButton className="googelBut"
                    onClick={() => {
                        let response = openGoogleLoginPage()
                        console.log(response)
                    }}
                />
            </div>
        </Container>
    )
}

export default Login;