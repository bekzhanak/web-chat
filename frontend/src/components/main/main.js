import React from 'react';
import { Button, Col, Container, Row, FormControl, Card, Form } from 'react-bootstrap';
import { ChatList, MessageList } from 'react-chat-elements'
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './main.css'


const Main = (props) => {
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([])
    const [allChats, setAllChats] = useState([])
    const [currentChat, setCurrentChat] = useState(null)
    const [ws, setWs] = useState(null)
    const [isUsersOpen, setUsersOpen] = useState(false)
    const [users, setUsers] = useState([])
    let navigate = useNavigate();
    let usersAddToChat = []

    async function fetchChats() {
        await fetch("http://localhost:8000/api/user_chats/", {
            method: "GET",
            credentials: "include"
        }).then((response) => {
            if (response.status == 401) {
                navigate("/");
                return []
            }
            return response.json();
        }).then(
            (data) => {
                setChats(data);
                setAllChats(data);
            }
        )
    }

    useEffect(() => {
        fetchChats();
    }, []
    );

    const connectToChat = (id) => {
        let w = new WebSocket(`ws://localhost:8000/ws/${id}/`)

        w.onopen = () => {
            w.send(
                JSON.stringify({
                    "user": props.currentUser.id,
                })
            )
        }

        w.onmessage = (e) => {
            getMessages(currentChat);
        }

        return w;
    }

    let send = (e) => {
        e.preventDefault();
        let message = document.getElementById("inputMessage").value
        if (message.length) {
            ws.send(
                JSON.stringify({
                    "message": message
                })
            )
        }
        getMessages(currentChat);
    }

    let messageInput = currentChat != null ? (<Row>
        <Col xs={10}>
            <FormControl className='inputMessage' as='textarea' id="inputMessage">
            </FormControl>
        </Col>
        <Col>
            <Button variant="primary" onClick={send}>Send</Button>
        </Col>
    </Row>) : (<></>)

    const userChats = chats.map(
        (i) => {
            return (
                <ChatList
                    key={i.id}
                    className='chat-list'
                    onClick={() => {
                        getMessages(i.id);
                        setCurrentChat(i.id)
                        if (ws !== null) {
                            ws.close();
                        }
                        setWs(connectToChat(i.id));
                        let input = document.getElementById("inputMessage")
                        if (input)
                            input.value = "";
                    }}
                    dataSource={
                        [
                            {
                                title: i.name,
                                unread: 0,
                            },
                        ]} />
            )
        }
    )

    const getMessages = async (id) => {
        await fetch(`http://localhost:8000/api/chat/${id}/`, {
            method: "GET",
            credentials: "include"
        }).then((response) => {
            if (response.status === 200)
                return response.json()
        }).then((data) => {
            if (data)
                setMessages(data)
        })
    }

    const chatMessages = messages.map(
        (i) => {
            let pos;
            if (i.user == props.currentUser.id)
                pos = "right"
            else
                pos = "left"
            return (<MessageList
                lockable={true}
                toBottomHeight={'100%'}
                dataSource={[
                    {
                        position: pos,
                        type: 'text',
                        text: i.text,
                        date: i.date,
                    },
                ]} />)
        }
    )

    const filterChats = () => {
        let query = document.getElementById("searhChat").value
        let newChats = allChats.filter(i => i.name.toLowerCase().includes(query))
        setChats(newChats)
    }

    let showUsers = async () => {
        await fetch("http://localhost:8000/api/users/", {
            method: "GET",
            credentials: "include"
        }).then((response) => response.json())
            .then((data) => setUsers(data))
        setUsersOpen(true)
    }

    let usersList = users.map(
        (i) => {
            if (i.id != props.currentUser.id)
                return (
                    <Row className={`userEmail-${i.id}`} >
                        <Col>
                            <Card bg="light" onClick={() => {
                                addUserToChat(i.id)
                                let u = document.getElementById(`userEmail-${i.id}`)
                                u.style.backgroundColor = u.style.backgroundColor == "green" ? "white" : "green"
                            }}>
                                <Card.Body id={`userEmail-${i.id}`}>{i.email}</Card.Body>
                            </Card>
                        </Col>
                    </Row >
                )
        }
    )

    let addUserToChat = (id) => {
        if (usersAddToChat.includes(id)) {
            const index = usersAddToChat.indexOf(id);
            usersAddToChat.splice(index, 1);
        }
        else usersAddToChat.push(id)
    }

    let createChat = async () => {
        await fetch("http://localhost:8000/api/create_chat/", {
            method: "POST",
            credentials: "include",
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(
                {
                    "name": document.getElementById("chatName").value,
                    "users": usersAddToChat.join(";")
                }
            ),
        })
        fetchChats()
        setUsersOpen(false)
    }

    let chatOrUsersList = isUsersOpen ? (<>
        <div className='usersList'>
            <h3>Select users to add to chat</h3>
            <FormControl type="text" placeholder='Name of chat' id="chatName" />
            <Row>
                <Button variant="danger" onClick={() => setUsersOpen(false)}> Close </Button>
            </Row>
            {usersList}
        </div>
        <Row>
            <Button variant="success" onClick={createChat}> Create </Button>
        </Row>
    </>) : (
        <div className="chatsList">
            <Row>
                <Col xs={6}>
                    <FormControl type='text' id='searhChat' onChange={filterChats} placeholder='Search chats' />
                </Col >
                <Col >
                    <Button variant="primary" onClick={() => showUsers()}>Create</Button>
                </Col>
            </Row >
            <Row>
                {userChats}
            </Row>
        </div>
    )

    return (
        <Container className='chats'>
            <Row>
                <Col xs={3} className='chatList'>
                    {chatOrUsersList}
                </Col>
                <Col xs={9} className='messages'>
                    <div className='message-list'>
                        {chatMessages}
                    </div>
                    {messageInput}
                </Col>
            </Row>
        </Container>
    )
}

export default Main;