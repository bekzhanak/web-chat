from django.db import models
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
# Create your models here.

class UserManager(BaseUserManager):
    def create_user(self,email,password):
        email = self.normalize_email(email)
        user=User(email=email)
        user.set_password(password)
        user.save()
        return user
    def user_by_email(self,email):
        users = User.objects.all()
        for i in users:
            if i.email == email :
                return i
        return None

class User(AbstractBaseUser):
    email = models.CharField(max_length=100,unique=True)
    password=models.CharField(max_length=128)
    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS=['password']
    
    objects = UserManager()
    
        
class ChatGroup(models.Model):
    name=models.CharField(max_length=100)
    users=models.ManyToManyField(User)

class Message(models.Model):
    text=models.TextField()
    date=models.DateTimeField(auto_now_add=True)
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    chat_id=models.ForeignKey(ChatGroup,on_delete=models.CASCADE)
    
    