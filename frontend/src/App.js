import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './components/header/Header';
import Login from './components/login/Login';
import Register from './components/register/Register'
import Main from './components/main/main';
import Home from './components/home/home';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-chat-elements/dist/main.css'
import { useState, useEffect } from 'react';

const App = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    async function fetchData() {
      await fetch("http://localhost:8000/api/user/", {
        method: "GET",
        credentials: "include"
      }).then(
        (response) => {
          if (response.status === 404 || response.status === 401) {
            return null;
          }
          return response.json()
        }
      ).then(
        (data) => {
          if (data == null) {
            return;
          }
          setUser(data)
        }
      )
    }
    fetchData();
  }, [])
  return (
    <BrowserRouter>
      <Header currentUser={user} />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='main/' element={<Main currentUser={user} />} />
        <Route path="login/" element={<Login currentUser={user} />} />
        <Route path='register/' element={<Register currentUser={user} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
