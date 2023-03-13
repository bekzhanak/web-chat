from django.urls import path
from .views import register, login,all_users,logout,user,create_chat,list_chats,user_chats, chat_messages,google_login

urlpatterns = [
    path("register/",register,name="register"),
    path("login/",login, name="login"),
    path("user/",user,name="get_current_user"),
    path("logout/",logout),
    path("users/",all_users),
    path("create_chat/", create_chat),
    path("chats/",list_chats),
    path("user_chats/",user_chats),
    path("chat/<int:id>/",chat_messages),
    path("login/google/",google_login),
]
