import { Container } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const register = async (e) => {
    e.preventDefault();
    let email = document.getElementById("email").value
    let password = document.getElementById("password").value
    await fetch("http://localhost:8000/api/register/", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            email,
            password
        })
    })
    window.history.pushState({}, "login", "/login/");
    window.location.reload();
}

const Register = () => {
    return (
        <Container className='loginContainer'>
            <h1> Register Page</h1>
            <Form className=''>
                <Form.Group className="mb-3">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" placeholder="Enter email" id="email" />
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" id="password" />
                </Form.Group>
                <Button className='loginButton' variant="primary" type="submit" onClick={register}>
                    Submit
                </Button>
            </Form>
        </Container>
    )
}

export default Register;