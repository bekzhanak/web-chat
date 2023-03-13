from rest_framework.decorators import api_view,permission_classes
from .serializers import UserSerializer,ChatGroupSerializer, MessagesSerializer,UsersSerializer
from rest_framework.response  import Response
from django.http.response import HttpResponse
from rest_framework import status
from .models import User, ChatGroup, Message
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
import datetime
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from .authenticate import CustomAuthentication
import requests
import google_auth_oauthlib.flow
import uuid 


# Create your views here.

@api_view(http_method_names=["POST"])
def register(request):
    data=UserSerializer(data=request.data)
    if not data.is_valid():
        return Response(status=status.HTTP_400_BAD_REQUEST,data={"message":"Missing email or password"})
    users = User.objects.all()
    for i in users:
        if data.validated_data['email'] == i.email:
            return Response(status=status.HTTP_400_BAD_REQUEST,data={"message":"Account with this email already exists"})
    user = User.objects.create_user(email=data.validated_data.get('email'),password=data.validated_data.get('password'))
    return Response(status=status.HTTP_200_OK,data={"message":"ok"})
    
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
        
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
            }

@api_view(http_method_names=["POST"])
def login(request):
    ser = UserSerializer(data=request.data)
    if not ser.is_valid():
        return Response(status=status.HTTP_400_BAD_REQUEST,data={"message":"Missing email or password"})
    user = User.objects.user_by_email(email=ser.validated_data.get('email'))
    if user is None:
        return Response(status=status.HTTP_400_BAD_REQUEST,data={"message":"Provide valid email"})
    is_authenticated = check_password(ser.validated_data.get('password'),user.password)
    if not is_authenticated:
        return Response(status=status.HTTP_400_BAD_REQUEST,data={"message":"Provide valid email and password"})
    token = get_tokens_for_user(user)
    response = Response(status=status.HTTP_200_OK,data={"message":"ok"})
    response.set_cookie(
                            key = settings.SIMPLE_JWT['AUTH_COOKIE'], 
                            value = token["access"],
                            expires = datetime.timedelta(hours=24),
                            secure = settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                            httponly = settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                            samesite = settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
                                )
    print(token['access'])
    return response

@api_view(http_method_names=["POST"])
def logout(request):
    respone = Response(status=status.HTTP_200_OK,data={"message":"ok"})
    respone.delete_cookie(key=settings.SIMPLE_JWT['AUTH_COOKIE'])
    return respone

def get_user(request):
    auth = CustomAuthentication()
    user = auth.authenticate(request)
    if user is None:
        return None
    user = User.objects.get(email=user[0].email)
    return user

@api_view(http_method_names=["GET"])
def user(request):
    user = get_user(request)
    if user is None:
        return Response(status=status.HTTP_404_NOT_FOUND,data={"message" : "User not found"})
    return Response(status=status.HTTP_200_OK, data={"id":f"{user.pk}","email" : f"{user.email}"})

@api_view(http_method_names=["POST"])
@permission_classes([IsAuthenticated])
def create_chat(request):
    ser = ChatGroupSerializer(data=request.data)
    if not ser.is_valid():
        return Response(status=status.HTTP_400_BAD_REQUEST,data={"message":"Provide valid data"})
    users_id = ser.validated_data['users'].split(';')
    user = get_user(request)
    users_id.append(user.id)
    users = User.objects.filter(id__in=users_id)
    chat=ChatGroup(name=ser.validated_data['name'])
    chat.save()
    chat.users.set(users)
    chat.save()
    return Response(status=status.HTTP_200_OK,data={"message":"ok"})

@api_view(http_method_names=["GET"])
def list_chats(request):
    chats=ChatGroup.objects.all()
    users_id=[]
    for i in chats:
        temp = []
        for j in i.users.all():
            temp.append(str(j.pk))
        temp = ";".join(temp)
        users_id.append(temp)
    data = [{"name" : chats[i].name, "users" : users_id[i]} for i in range(len(chats))]
    return Response(status=status.HTTP_200_OK,data=data)
    
    
@api_view(http_method_names=["GET"])
@permission_classes([IsAuthenticated])
def user_chats(request):
    user = get_user(request)
    chats=ChatGroup.objects.all()
    user_chats = []
    for i in chats:
        for j in i.users.all():
            if user.id == j.id:
                user_chats.append(i)
    users_id=[]
    for i in user_chats:
        temp = []
        for j in i.users.all():
            temp.append(str(j.pk))
        temp = ";".join(temp)
        users_id.append(temp)
    data = [{"id" : user_chats[i].id ,"name" : user_chats[i].name, "users" : users_id[i]} for i in range(len(user_chats))]
    return Response(status=status.HTTP_200_OK,data=data)

@api_view(http_method_names=["GET"])
@permission_classes([IsAuthenticated])
def chat_messages(request,id):
    messages = Message.objects.filter(chat_id=id)
    ser = MessagesSerializer(messages,many=True)
    return Response(status=status.HTTP_200_OK,data=ser.data)

@api_view(http_method_names=["GET"])
@permission_classes([IsAuthenticated])
def all_users(request):
    users = User.objects.all()
    data = UsersSerializer(users,many=True)
    return Response(status=status.HTTP_200_OK,data=data.data)


@api_view(http_method_names=["GET"])
def google_login(request):
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
    'client_secret.json',
    scopes=None)
    flow.redirect_uri="http://localhost:8000/api/login/google/"
    flow.fetch_token(authorization_response=request.get_full_path())
    code = flow.credentials.token
    response = requests.get(f"https://www.googleapis.com/oauth2/v2/userinfo?fields=email&access_token={code}")
    email = response.json()['email']
    user,created = User.objects.get_or_create(email=email)
    if created:
        user = created
    password = str(uuid.uuid4())
    user.set_password(password)
    user.save()
    return HttpResponse(f"User has been created, now return to the page and login using your email and {password} as password")

