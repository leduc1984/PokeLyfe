# Create your views here.
# WEENIES!!!!!

from itertools import product
from django.http import HttpResponse, HttpResponseRedirect
from django.template import Context, loader, RequestContext
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import redirect
import time
import json
from models import *

@login_required(login_url="SignUp")
def home(request):
    cid = request.session.get("charid")
    try:
        c = Character.objects.get(id=cid)
    except Exception:
        c = Character.objects.get(user=request.user)
        request.session["charid"] = c.id
        request.session.save()

    
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

def timenow(request):
    return HttpResponse(time.time(), content_type="text/plain")

@login_required(login_url="SignUp")
def getchar(request):
    cid = request.session.get("charid")
    try:
        c = Character.objects.get(id=cid)
    except Exception:
        c = Character.objects.create(x=100,
                                     y=100,
                                     last_online = time.time())
        request.session["charid"] = c.id
        request.session.save()
    return c

def keydown(request):
    """
    The client will send a request to this view
    whenever a key is pressed.  This view will update
    the character's position in the database, but it
    will not actually return any data.

    Example use:
    /keydown?key=up
    /keydown?key=down
    """
    # cid = request.session.get("charid")
    # if cid:
    #     c = Character.objects.get(id=cid)
    # else:
    #     c = Character.objects.create(x=100,
    #                                  y=100)
    #     request.session["charid"] = c.id
    #     request.session.save()
    c = getchar(request)
    dy = 30
    dx = 30
    pressed = lambda s: request.GET.get(s) == "true"
    dirs = {"up":"c.y-=dy",
            "down":"c.y+=dy",
            "left":"c.x-=dx",
            "right":"c.x+=dx",
            }
    for d, s in dirs.items():
        if pressed(d):
            exec(s) in globals(), locals()
    c.save()    
    return HttpResponse()

@login_required(login_url="SignUp")
def myposition(request):
    """
    This simpy returns the current x, y coordinate
    of the client's character.  This will be called
    in onFrame in the JavaScript.
    """
    c = getchar(request)
    c.last_online = time.time()
    c.save()
    return HttpResponse(json.dumps({"x":c.x,
                                    "y":c.y,
                                    "id":c.id}),
                        content_type="application/json")

@login_required(login_url="SignUp")
def other_chars(request):
    c = getchar(request)
    data = []
    for char in Character.objects.exclude(id=c.id):
        data.append({"index":char.id,
                     "x":char.x,
                     "y":char.y,
                     "last_online":char.last_online,
                     "my_last_online":c.last_online})
    return HttpResponse(json.dumps(data), content_type="application/json")

##################
@login_required(login_url="SignUp")
def get_me(request):
    c = getchar(request)
    return HttpResponse(json.dumps({"x":c.x,
                                    "y":c.y,
                                    "id":c.id}),
                        content_type="application/json")

@login_required(login_url="SignUp")
def update(request):
    c = getchar(request)
    if request.GET.get("x") and request.GET.get("y"):
        c.x, c.y = int(request.GET["x"]), int(request.GET["y"])

    c.last_online = time.time()
    c.save()
    data = []
    for char in Character.objects.exclude(id=c.id):
        data.append({"x":char.x,
                     "y":char.y,
                     "id":char.id,
                     "online":time.time() - char.last_online < 3
                     })
    return HttpResponse(json.dumps(data), content_type="application/json")

def signup(request):
    if request.user.is_authenticated():
        return HttpResponseRedirect('home')
    return HttpResponse(loader.get_template("signup.html").render(RequestContext(request, {})))


def register(request):
    p = request.POST.get
    if (p("username") and
        p("email") and
        p("password") and
        p("password") == p("confirm_password")):
        u = User.objects.create_user(username=p("username"),
                                     password=p("password"),
                                     email=p("email"))
        c = Character.objects.create(user=u,
                                     x=100,
                                     y=100,
                                     last_online=time.time())
        request.session["charid"] = c.id
        u = authenticate(username=p("username"), password=p("password"))
        if u is not None:
            login(request, u)
            return HttpResponseRedirect('home')
    return HttpResponseRedirect('SignUp')

def my_login(request):
    username = request.POST.get("username")
    password = request.POST.get("password")
    if username and password:
        user = authenticate(username=username,
                            password=password)
        if user:
            login(request, user)
    return HttpResponseRedirect('home')

def my_logout(request):
    logout(request)
    return HttpResponseRedirect('SignUp')
