import { Navbar, Nav, Container, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import './header.css'

const logout = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:8000/api/logout/", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    })
    window.location.reload();
}


const Header = (props) => {
    let navigate = useNavigate()
    let menu;
    if (props.currentUser == null) {
        menu = (
            <>
                <Col xs={1}>
                    <Nav.Link className='navtext' onClick={() => navigate('login/')}><span>Login</span></Nav.Link>
                </Col>
                <Col xs={1}>
                    <Nav.Link className='navtext' onClick={() => navigate("register/")}><span>Register</span></Nav.Link>
                </Col>
            </>
        )
    }
    else {
        menu = (
            <>
                <Col xs={2}>
                    <Nav.Link className='navtext' onClick={() => navigate('main/')}><span>{props.currentUser.email}</span></Nav.Link>
                </Col>
                <Col xs={1}>
                    <Nav.Link className='navtext' onClick={logout}><span>Logout</span></Nav.Link>
                </Col>
            </>
        )
    }

    return (
        <Navbar bg='primary' variant='dark'>
            <Container>
                <Col xs={9}>
                    <Navbar.Brand className="webchat" onClick={() => navigate("main/")}>Web Chat</Navbar.Brand>
                </Col >
                {menu}
            </Container>
        </Navbar>
    )
}

export default Header;