# Create your views here.
from itertools import product
from django.http import HttpResponse, HttpResponseRedirect
from django.template import Context, loader, RequestContext
import time
import json
from models import *

def home(request):
    cid = request.session.get("charid")
    try:
        c = Character.objects.get(id=cid)
    except Exception:
        c = Character.objects.create(x=100,
                                     y=100,
                                     last_online = time.time())
        request.session["charid"] = c.id
        request.session.save()
    fields = {"imagenames":
              ["".join(e) for e in product(["up",
                                            "down",
                                            "left",
                                            "right"],
                                           "0123")]}
    context = RequestContext(request, fields)
    template = loader.get_template("papertutorial.html")
    return HttpResponse(template.render(context))

def timenow(request):
    return HttpResponse(time.time(), content_type="text/plain")

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

def myposition(request):
    """
    This simpy returns the current x, y coordinate
    of the client's character.  This will be called
    in onFrame in the JavaScript.
    """
    c = getchar(request)
    # c.last_online = time.time()
    # c.save()
    return HttpResponse(json.dumps({"x":c.x,
                                    "y":c.y,
                                    "id":c.id}),
                        content_type="application/json")

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
