---

title: "Develop RESTful Services Like a Ninja: Part 2"
date: 2011-06-28
author: 2
description: "In the second part of this tutorial about developing a RESTful service we'll show how to achieve ninja-like productivity using RESTEasy, Intellij and JRebel. Java developers - especially the ones working in enterprise projects - are used to time consuming develop-deploy-test cycles. Even a small change to a Java class, forces the web application do be redeployed to the application server for testing. Often enterprise application servers are slow to restart and it doesn't take much before you have wasted one hour every day in the frustrating develop-deploy test loop."

---

In the second part of this tutorial about developing a RESTful service we'll show how to achieve ninja-like productivity using RESTEasy, Intellij and JRebel. Java developers - especially the ones working in enterprise projects - are used to time consuming develop-deploy-test cycles. Even a small change to a Java class, forces the web application do be redeployed to the application server for testing. Often enterprise application servers are slow to restart and it doesn't take much before you have wasted one hour every day in the frustrating develop-deploy test loop.

JRebel, on the contrary, notices such changes and reloads the modified class inside a running JVM. That, in turn, makes it unnecessary to restart a running application server during development. Nice and easy, and above all, fast. It happens that JRebel plays nicely also with RESTEasy. You can modify any JAX-RS annotation on your REST service and JRebel will reload the class for you. This feature is quite powerful when developing a RESTful API: it takes several iterations before the API is stabilized.

So, let's check out how to configure IntelliJ Idea and JRebel to launch the RESTEasy project we created in [part 1][0].

## Starting the web app from inside IDEA

Before we start, you need to install the Idea's "[Jetty Integration][1]" plugin. Done? Ok. You should also have a copy of Jetty 6.1.x somewhere on your filesystem.

If you have followed the steps from the first part of this tutorial, you should have a "rest-blog" module in IntelliJ Idea.

Open the "Module Settings" for the "rest-blog" module (click F4 once you have selected the module in the editor left pane) and click on the "Artifacts" section in order to create a deployable artifact (aka, our rest-blog web application).

Click on the small "+" icon and select "Web Application:exploded". Give it a name and right-click on the "rest-blog" folder in the "Available elements" pane. Select "Put into output root".

![](http://aetomation.aestasit.com/img/blog/2011/06/put_output_root.png.scaled1000-300x159.png)

Finally, select again the small "+" icon this time under the "Output layout" tab and select "File".

![](http://aetomation.aestasit.com/img/blog/2011/06/add_file.png.scaled500-300x154.png)

In the file selection window, navigate to your project folder and select the "web.xml" file under /src/main/webapp/WEB-INF.

Click "OK", you are done with the artifact creation.

The last step is to create a "Run/Debug configuration" that will actually deploy the web application and start it. Tap ALT+SHIFT+F10 (OPT+SHIFT+F10 on Mac) to open the "Edit Run configuration" page.

Click once more on the "+" icon and select "Jetty Server", "Local" as displayed in the image.

![](http://aetomation.aestasit.com/img/blog/2011/06/add_jetty_local-300x272.png)

Name the new configuration and configure the Jetty Server location, clicking on "Configure".

Click on the "Deployment" tab and add the previously created artifact. Don't forget to specify a Context Path (for instance, "/rest-blog"). If you don't specify a path, **the deployment will not work**. Click "OK" and you should good to go.

Start the newly created configuration and fire your browser to [http://localhost:8080/rest-blog/blog/post/10][5]

You should see again the same JSON output you have seen in part 1\. No difference really, except that now the application is deployed within Idea.

## Enter JRebel

Now comes the fun part. We are going to enable JRebel instant redeploy of Java classes and - since version 3.5 - Resteasy annotations. There is some more configuration before you can try out the JRebel awesomess. The path to becoming a productivity ninja is long and tortuous and goes through a lot of configuration :)

If you haven't downloaded it yet, fetch a copy of JRebel from the [Zeroturnaround][6] web site and unzip it.

Install the Intellij JRebel plugin (check out the [screencast][7] from the guys at Zeroturnaround) and configure it, by adding the location of the JRebel jar file.

You also need to enable RESTEasy support. Open the JRebel configuration settings and click on the big "Launch" button near the "Agent Setting" label.

Select the "Plugin" tab and check the "Resteasy Plugin" support, as displayed in the following image.

![](http://aetomation.aestasit.com/img/blog/2011/06/resteasy_plugin.png.scaled500-287x300.png)

You are almost there. Create a "rebel.xml" file by right-clicking on your IDEA module icon and select "Generate rebel.xml".

As an effect of installing the JRebel plugin, you should see two new buttons in your IDEA toolbar. "Run with JRebel" and "Debug with JRebel".

![](http://aetomation.aestasit.com/img/blog/2011/06/jrebel_icon-300x156.png)

Start the "rest-blog" app using the "Run with JRebel" button. As with running the application using the default "Run" button, you should be able to see the usual JSON payload when you hit [http://localhost:8080/rest-blog/blog/post/10][5] in your browser.

## Reloading classes

In Idea, open the Java class `RestBlogService` and change the code that creates the `Blog` post. Do not shut down the application running in Jetty.

```java
BlogPost blogpost = new BlogPost(Long.parseLong(id), "My Old Car", "I Sold My Car", new Date(), "me");
```

Press `CTRL+F10` (or `OPT+F10` on Mac) to reload the code. Idea will show you a box, choose "Update classes and resource" and reload your browser.

The payload should now look like:

```json
{
  "post":{
     "author":"me",
     "context":"I Sold My Car",
     "id":10,
     "postDate":"2011-04-13T22:39:39.184+02:00",
     "title":"My Old Car"
  }
}
```

No need to redeploy or restart the Jetty server. And you haven't seen nothing!

Go back to the `RestBlogService` and change the `@Path` annotation so that it looks like:

```java

@GET
@Path("blogpost/{id}")
@Produces("application/json")
public BlogPost getPostById(@PathParam("id") String id) {

```

Tap `CTRL+F10` (or `OPT+F10` on Mac) again and browse to [http://localhost:8080/rest-blog/blog/blogpost/10][5].

The familiar JSON payload should appear on your browser page.

Not only you can modify the code, you can also modify RESTEasy annotations on the flight. The JRebel site has a [screen][10]-[cast][10] showing the RESTEasy integration in more details.

How about posting something?

Go back to the `RestBlogService` class and add a public method for posting a JSON payload, remember no need to redeploy to Jetty.

```java

@POST
@Path("blogpost")
@Consumes("application/json")
public Response savePost(BlogPost blogPost, @Context UriInfo uriInfo) {
  System.out.println(blogPost.getId()); // save the blog post
  URI newURI = uriInfo.getBaseUriBuilder().path(BlogServiceRestImpl.class, "getPostById").build(blogPost.getId());
  return Response.created(newURI).build();
}

```

The `savePost` method merits a bit of explanation. First, you'll notice the two new annotations. `@POST` signals to RESTEasy that this method can be invoked through an HTTP POST. The POST verb is normally used in RESTFul services when creating a new resource. `@Consumes` is used to signal the server that only the content type `application/json` is accepted.

The actual Java method also contains some interesting bits. The method returns a `javax.ws.rs.core.Response` object. This is a generic REST response that can represent different status codes, such as `404` (resource not found), `201` (created) or `200` (ok).

The method's arguments are the `BlogPost` object and an annotated `UrlInfo` object. RESTEasy expects the `BlogPost` object as a JSON payload. If the payload's content type is `application/json`, the framework de-serialize the payload to the corresponding Java object - the `BlogPost`. The whole process is completely transparent.

The `UrlInfo` object is injected by RESTEasy, thanks to the [`@Context`][11] annotation. We need the `UriInfo` object in order to build the `URI` that we return in the `Response`. From the [HTTP Specs][12]:

> If a resource has been created on the origin server, the response SHOULD be 201 (Created) and contain an entity which describes the status of the request and refers to the new resource, and a Location header.

That is exactly what we do at line 7.

Reload the application - `CTRL+F10` (or `OPT+F10` on Mac) and from the terminal, type:

```bash
curl -v -H "Content-Type: application/json" -X POST -d '{"post":{"author":"Admin","context":"A post about Scala","id":10,"title":"Scala rocks"}}' http://localhost:8080/rest-blog/blog/blogpost
```

(if you use Windows, you can install cURL as explained [here][13]. Alternatively, if you don't like messing around with the console, check out the [REST Client Firefox extension][14]).

The response that you receive from the server looks like:

```bash
HTTP/1.1 201 Created
Date: Wed, 13 Apr 2011 21:37:45 GMT
Location: http://localhost:8080/rest-blog/blogpost/10
Content-Length: 0
Server: Jetty(6.1.26)
```

...and in the IntelliJ Idea console you should see the output of the `System.out` on line 6 of the above snippet.

I hope you start appreciating the kind of productivity you can achieve using JRebel in conjunction with RESTEasy. JRebel can also be used during web applications development, when using frameworks like Spring MVC, Wicket or Seam.

This close the second part of the tutorial. The astute readers of this blog may have noticed the complete lack of unit testing. In the third installment of this tutorial I'm going to illustrate how to unit test RESTEasy services.


[0]: http://blog.aestasit.com/develop-restful-services-like-a-ninja-part-1/
[1]: http://plugins.intellij.net/plugin/?id=1311 "Jetty Plugin"
[2]: http://aetomation.aestasit.com/img/blog/2011/06/put_output_root.png.scaled1000.png
[3]: http://aetomation.aestasit.com/img/blog/2011/06/add_file.png.scaled500.png
[4]: http://aetomation.aestasit.com/img/blog/2011/06/add_jetty_local.png
[5]: http://localhost:8080/rest-blog/blog/post/10
[6]: http://www.zeroturnaround.com/jrebel/ "ZeroTurnaround"
[7]: http://www.zeroturnaround.com/wp-content/themes/zeroturnaround4.0/modals/jrebelIdeaScreencast.php "JRebel Idea"
[8]: http://aetomation.aestasit.com/img/blog/2011/06/resteasy_plugin.png.scaled500.png
[9]: http://aetomation.aestasit.com/img/blog/2011/06/jrebel_icon.png
[10]: http://www.zeroturnaround.com/screencast-resteasy-application-instant-updates-with-jrebel/ "screencast"
[11]: http://docs.jboss.org/resteasy/docs/2.0.0.GA/userguide/html_single/index.html#_Context
[12]: http://www.ietf.org/rfc/rfc2616.txt
[13]: http://superuser.com/questions/134685/run-curl-commands-from-windows-console "cURL on windows"
[14]: https://addons.mozilla.org/en-US/firefox/addon/restclient/