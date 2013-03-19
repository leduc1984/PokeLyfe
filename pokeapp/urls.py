from django.conf.urls.defaults import patterns, include, url


urlpatterns = patterns('pokeapp.views',
                       url(r'^home$', 'home'),
                       url(r'^time$', 'timenow'),
                       url(r'^movement$','movement'),
                       url(r'^keydown$', 'keydown'),
                       url(r'^myposition$', 'myposition'),
                       url(r'^other_chars$', 'other_chars'),
                       url(r'^get_me$', 'get_me'),
                       url(r'^update$', 'update'),
                       url(r'^SignUp$', 'signup'),
                       url(r'^register$', 'register'),
                       url(r'^login$', 'my_login'),
                       url(r'^logout$', 'my_logout'),
                       url(r'^send_message$', 'send_message'),
    # Examples:
    # url(r'^$', 'Pokemon.views.home', name='home'),
    # url(r'^Pokemon/', include('Pokemon.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)

