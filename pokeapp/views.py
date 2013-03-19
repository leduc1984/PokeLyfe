# Create your views here.

from itertools import product
from django.http import HttpResponse, HttpResponseRedirect
from django.template import Context, loader, RequestContext
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import redirect
from django.db import IntegrityError
import time
import json
from models import *
from datetime import datetime, timedelta

def getchar(request):
    return Character.objects.get(user=request.user)

@login_required(login_url="SignUp")
def home(request):
    c = getchar(request)
    fields = {"imagenames":
              ["".join(e) for e in product(["up",
                                            "down",
                                            "left",
                                            "right"],
                                           "0123")]}
    fields["username"] = request.user.username
    context = RequestContext(request, fields)
    template = loader.get_template("home.html")
    return HttpResponse(template.render(context))

@login_required(login_url="SignUp")
def get_me(request):
    c = getchar(request)
    return HttpResponse(json.dumps({"x":c.x,
                                    "y":c.y,
                                    "id":c.id,
                                    "messages": c.get_messages()}),
                        content_type="application/json")

@login_required(login_url="SignUp")
def update(request):
    if request.POST.get("x") and request.POST.get("y"):
        c = Character.objects.get(user=request.user)
        c.x, c.y = int(request.POST["x"]), int(request.POST["y"])
        c.last_online = time.time()
        c.save()
    return HttpResponse()

@login_required(login_url="SignUp")
def other_chars(request):
    data = []
    for char in Character.objects.exclude(user=request.user):
        data.append({"x":char.x,
                     "y":char.y,
                     "id":char.id,
                     "online":time.time() - char.last_online < 3,
                     "messages":char.get_messages(),
                     })
    return HttpResponse(json.dumps(data), content_type="application/json")

def signup(request, **errors):
    errors = {key:str(value[0]) if type(value) is list else value
              for key, value in errors.items()}
    if request.user.is_authenticated():
        return HttpResponseRedirect('home')
    # errors.update(request.POST)
    template = loader.get_template("signup.html")
    context = RequestContext(request, errors)
    return HttpResponse(template.render(context))


def register(request):
    p = request.POST.get
    if (p("reg_username") and
        p("email") and
        p("reg_password") and
        p("reg_password") == p("confirm_password")):
        if not User.objects.filter(email=p("email")):
            try:
                u = User.objects.create_user(username=p("username"),
                                             password=p("password"),
                                             email=p("email"))
                c = Character.objects.create(user=u,
                                             x=100,
                                             y=100,
                                             last_online=time.time())
                u = authenticate(username=p("username"), password=p("password"))
                if u is not None:
                    login(request, u)
                    return HttpResponseRedirect('home')
            except IntegrityError:
                return signup(request, already_used=True, **request.POST)
        else:
            return signup(request, email_used=True, **request.POST)
    elif p("reg_password") != p("confirm_password"):
        return signup(request, not_match=True, **request.POST)
    else:
        return signup(request, blank_fields=True, **request.POST)
                

def my_login(request):
    username = request.POST.get("log_username")
    password = request.POST.get("log_password")
    if username and password:
        user = authenticate(username=username,
                            password=password)
        if user:
            login(request, user)
            return HttpResponseRedirect('home')
    return signup(request, invalid_attempt=True, **request.POST)

def my_logout(request):
    logout(request)
    return HttpResponseRedirect('SignUp')

@login_required(login_url="SignUp")
def send_message(request):
    p = request.POST.get
    if p("text") and p("recipients"):
        c = getchar(request)
        c.send_message(p("text"), p("recipients"))
    return HttpResponse()
                       
