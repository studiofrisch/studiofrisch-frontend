---

title: "Develop RESTful Services Like a Ninja: Part 1"
date: 2011-06-28
author: 1
description: "In this first post we will cover a lot of our favorite tools - Gradle, Jetty, JRebel and IntelliJ Idea. We are going to build a very simple RESTFul API using the awesome RESTEasy framework and show how to shorten the build/deploy/test cycle with JRebel. The tutorial is split in three parts."

---

In this first post we will cover a lot of our favorite tools - Gradle, Jetty, JRebel and IntelliJ Idea. We are going to build a very simple RESTFul API using the awesome RESTEasy framework and show how to shorten the build/deploy/test cycle with JRebel. The tutorial is split in three parts.

The first part will explain how to create a RESTful blogging service with Gradle and RESTEasy in literally 3 minutes.

Tools:

* Java 6
* [Intellij IDEA 10][0]
* Jetty Integration Intellij plugin
* [Gradle 0.9.2][1] and [installation guide][2]
* [Jetty 6.1.2x][3]
* [Rebel 3.5][4]
    
## Start from scratch
Let's start with creating the project's folders structure and the Gradle build file.
Gradle is the most awesome build tool for JVM based languages. If you don't know Gradle, [read][5] [about][6] [it][7] and make it your tool of choice for building code (yes, Gradle kicks Maven ass big time).

Gradle doesn't support Maven-like archetypes (yet) and this is probably the only manual tedious task in the whole setup.

Create a folder structure similar to the one in the picture below.

![](http://aetomation.aestasit.com/img/blog/2011/06/folders.png.scaled500-300x112.png)

You have probably noticed that the folder structure is identical to the Maven web-app artifact.

Now, let's create the Gradle build file, `build.gradle`:

```groovy
apply plugin: 'java'
apply plugin: 'jetty'
apply plugin: 'idea'

version = '1.0-SNAPSHOT'
group = 'com.aestasit.restdemo'
jettyRun.contextPath = '/rest-blog'
repositories {
  mavenCentral()
  mavenRepo urls: "http://repository.jboss.org/nexus/content/groups/public/"
  mavenRepo urls: "https://oss.sonatype.org/content/repositories/sourceforge-releases/"
}

dependencies {
  compile 'org.jboss.resteasy:resteasy-jaxrs:2.0.1.GA'
  compile 'org.jboss.resteasy:resteasy-jettison-provider:2.0.1.GA'
  compile 'javax.servlet:servlet-api:2.5'
}
```

Place the file in the root of the project. At this point, you can build the project running the following Gradle task in the command line:

```bash
gradle build
```

There is not much to build yet, so objectively the outcome of this step is not very interesting. You'll notice that Gradle will fetch the RESTEasy libraries and their dependencies for you (this is going to take some time).

Let's add some code, using our favourite IDE, Intellij IDEA. But first, we need to generate the IDEA project files. Couldn't be easier. Go back to the command prompt and type:

```bash
gradle idea
```

Three IDEA project files will appear in the root directory. Now fire IDEA and create a new Java project ( *File* > *Create project from scratch* ). Name the project whatever you like and remember to check "Do not create source directory". The project should be located outside the Gradle project folder.

Once the project is created, add the a new module ( *File* > *New module* > *Import existing module* ) and select the _iml_ file you have generated with Gradle. Now you should have your Rest project properly configured in Intellij IDEA. If you open the Project structure (F4) and select the "Dependencies" tab, you'll see that all the project dependencies (RESTEasy etc.) are set. You can start coding straight away.

## Where's the code?

We will create three classes exposing some methods for a simple blogging service.

The ubiquitous POJOs:

```java
@XmlRootElement(name = "post")
public class BlogPost implements Serializable {

  private long id;
  private String title;
  private String context;
  private Date postDate;
  private String author;

  public BlogPost() {} // Default Constructor, don't remove

  // ... add getters/setters and constructor ...
    
```

The Service interface:

```java
package com.aestasit.blog.rest;

import java.util.List;

public interface BlogService {

  BlogPost getPostById(String id);
  List getTags();
  
}
```

The Service implementation:

```java
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import java.util.Date;
import java.util.List;

@Path("blog")
public class RestBlogService implements BlogService {

  @GET
  @Path("post/{id}")
  @Produces("application/json")
  public BlogPost getPostById(@PathParam("id") String id) {
    // Database lookup and return the Blog post by ID
    // ...in the meanwhile, just for testing
    BlogPost blogpost = new BlogPost(Long.parseLong(id), "My new car", "I bought a car", new Date(), "me");
    return blogpost;
  }

  public List getTags() {
    return null;
  }

}
```

You have noticed that the Service implementation has some annotations. These are JAX-RS annotations that, along with the classes and interfaces provided by JAX-RS API, allow you to expose simple POJOs as web resources. I'm not going into too much details here about the JAX-RS API. I recommend you read the excellent [RESTEasy documentation][9] and, if you are completely new to RESTFul Services, take a look at TODO.

The first annotation `@Path("blog")` is the `URI` to the resource you want to `@GET` (REST supports `GET`, `POST`, `DELETE` and `UPDATE` HTTP protocol's methods). The annotation `@Produces` is behind the cardinal concept of Content Negotiation. With Content Negotiation a resource may have multiple representations in different formats, so a client can receive the best representation for its abilities. In our example, we are producing a JSON formatted response.

But wait, there is no reference to JSON in our code. Take a closer look to the POJO class. It contains a [JAXB][10] annotation `@XmlRootElement`. JAXB is "the" JAVA-XML binding framework. It's so good, that it became part of the Java 1.6 platform. Why JAXB? From Wikipedia:

> JAXB provides two main features: the ability to marshal Java objects into XML and the inverse, i.e. to unmarshal XML back into Java objects.

JAXB transforms objects into XML but not JSON. Again, take a closer look at the build file. One of the dependencies is `org.jboss.resteasy:resteasy-jettison-provider:2.0.1.GA`.

**Jettison** is a Codehaus [project][11] that serializes objects to/from JSON. JAXB can be "decorated" with different providers allowing the output to be formatted using different protocols. One of these providers is Jettison. From a development point of view, there is not much to do in order to return JSON: annotate your class using the JAXB annotations, drop into your classpath a JAXB provider and specify your content format in your Rest service. You can read more about RESTEasy and JAXB providers [here][12].

We are almost ready to test our little Rest service. Two more steps before we hit the red button.

Add this `web.xml` file to the `WEB-INF` folder:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://java.sun.com/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd"
         version="2.5">
    <servlet>
        <servlet-name>Resteasy</servlet-name>
        <servlet-class>
            org.jboss.resteasy.plugins.server.servlet.HttpServletDispatcher
        </servlet-class>
        <init-param>
            <param-name>javax.ws.rs.Application</param-name>
            <param-value>com.aestasit.blog.rest.bootstrap.ApplicationBootstrap</param-value>
        </init-param>
    </servlet>
    <servlet-mapping>
        <servlet-name>Resteasy</servlet-name>
        <url-pattern>/*</url-pattern>
    </servlet-mapping>
</web-app>
```

Add this class in one of your packages:

```java
import javax.ws.rs.core.Application;
public class ApplicationBootstrap extends Application {
    Set singletons = new HashSet();

    public ApplicationBootstrap() {
        singletons.add(new BlogServiceRestImpl());
    }

    @Override
    public Set&gt; getClasses() {
        HashSet&gt; set = new HashSet&gt;();
        return set;
    }

    @Override
    public Set getSingletons() {
        return singletons;
    }
}
```

The `ApplicationBootstrap` class is needed to actually initialize your Restful service. There are several ways to initialize a RESTEasy application. In a real-world system, I would probably use the super-easy Spring integration.

We can finally test our application. Go back to your console and type:

```bash
gradle clean jettyRun
```

If your code doesn't contains errors and all the plumbing is connecting the right dots, you should be able to fire your browser to [http://localhost:8080/rest-blog/blog/post/10][13] and display the JSON response:

```json
{
 "post":{
   "author":"me",
   "context":"I bought a car",
   "id":10,
   "postDate":"2011-04-08T00:26:59.231+02:00",
   "title":"My new car"
 }
}
```

Cool, uh? In the next part of this tutorial, we are going to introduce [JRebel][14] and how JRebel can help to achieve Ruby On Rails-like productivity.

You can find the code for this tutorial in the [Aestas Git Repo][15].


[0]: http://www.jetbrains.com/idea/download/
[1]: http://gradle.org/downloads.html
[2]: http://gradle.org/installation.html
[3]: http://dist.codehaus.org/jetty
[4]: http://www.zeroturnaround.com/jrebel/current/
[5]: http://www.javaexpress.pl/article/show/Gradle__a_powerful_build_system
[6]: http://www.gridshore.nl/2010/09/08/my-first-steps-with-gradle-creating-a-multi-module-java-web-project-and-running-it-with-jetty/
[7]: http://community.jboss.org/wiki/Gradlewhy
[8]: http://aetomation.aestasit.com/img/blog/2011/06/folders.png.scaled500.png
[9]: http://www.jboss.org/resteasy/docs
[10]: http://www.oracle.com/technetwork/articles/javase/index-140168.html#introjb
[11]: http://jettison.codehaus.org/
[12]: http://docs.jboss.org/resteasy/docs/2.0.0.GA/userguide/html/Built_in_JAXB_providers.html
[13]: http://localhost:8080/rest-blog/blog/post/10
[14]: http://www.zeroturnaround.com/jrebel/
[15]: https://github.com/aestasit/rest-blog