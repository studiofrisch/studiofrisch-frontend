---

title: Taking VMWare Cloud Foundry on a Test Drive
date: 2011-06-28
author: 2
description: "Few days ago VMware unveiled the company's Cloud Foundry open source platform-as-a-Service (PaaS) offering. This release allows developers to deploy Java/Spring, RubyOnRails and Node.js web application to a VMware-hosted cloud."

---

Few days ago VMware unveiled the company's Cloud Foundry open source platform-as-a-Service (PaaS) offering. This release allows developers to deploy Java/Spring, RubyOnRails and Node.js web application to a VMware-hosted cloud.

Cloud Foundry also offers some data services out of the box, namely MySql, MongoDb and Redis. No installation required, they just work.

The system is indeed very interesting but clearly it has huge room for improvement. The SpringSource folks are behind it so quality and stability - already impressively high - have to be expected in the future iterations of the platform.

Here at Aestas we decided to take Cloud Foundry for a quick test drive and report back about it.


In order to get started, a beta program invitation is needed. It doesn't take long to get one. Just head to [http://www.cloudfoundry.com/][0] and sign up. We got our invitation email after 4 days from the sign up.


Once the invitation mail is received, it is very simple to deploy an application. [Documentation][1] is a little scarce at the moment, but there is enough information to find your way around the system.


Currently there are two ways to interact with Cloud Foundry: **vmc**, a command line interface and **SBS**, a more user-friendly Eclipse plugin.


In this test drive, we are going to use vmc to deploy our application to Cloud Foundry.


These are the steps to install vmc on OS X.


Make sure your system runs Ruby 1.8.7 or higher:

```bash
ruby -v
ruby 1.8.7 (2009-06-12 patchlevel 174) [universal-darwin10.0]
```
    

Check your gem version, you should run at least version 1.7.2:

```bash
gem -v
```    

If you have an older version of gem, update it by running:

```bash
sudo gem update --system
```
    
Once prerequisites are clear, install `vmc `using `gem`:

```bash
sudo gem install vmc
```
    
and target it against Cloud Foundry:

```bash
vmc target api.cloudfoundry.com
```
    
Finally, log in with the credentials received by email:


```bash
vmc login
```     
    
For this test drive, we decided to try out a Java/Spring application.It is possible to deploy apps written in Ruby On Rails, Node.js and also Groovy (using a plugin) and Spring Roo.


The application source is available [on git][2]: git and you can test it live on Cloud Foundry: [http://aestas-cloudfoundry-demo.cloudfoundry.com/][3].


The application is very simple. I was interested in testing the data access and I went for [Redis][4], the blazing fast key-value store developed by [@antirez][5]. Using Redis also gave me the chance to test the new [Spring Data][6] project and specifically the Redis API.


You can clone the project on git or simply [browse the Java source code][7]. The project has few classes and it should be easy to follow.


It has only one page and one controller, from which it is possible to post and read key-value pairs from/to a Redis instance.


Once the application is packaged as a war, it is extremely simple to get it running on Cloud Foundry using vmc.


This is the console log of the vmc deploying the app:


```bash
localhost:cloudfoundry-demo luciano$ vmc push
Would you like to deploy from the current directory? [Yn]: n
Please enter in the deployment path: build/libs
Application Name: aestas-cloudfoundry-demo
Application Deployed URL: 'aestas-cloudfoundry-demo.cloudfoundry.com'?
Detected a Java SpringSource Spring Application, is this correct? [Yn]:
Memory Reservation [Default:512M] (64M, 128M, 256M, 512M, 1G or 2G)
Creating Application: OK
Would you like to bind any services to 'aestas-cloudfoundry-demo'? [yN]: y
The following system services are available::
1. mongodb
2. mysql
3. redis
Please select one you wish to provision: 3
Specify the name of the service [redis-d5b09]:
Creating Service: OK
Binding Service: OK
Uploading Application:
Checking for available resources: OK
Processing resources: OK
Packing application: OK
Uploading (5K): OK
Push Status: OK
``` 

Not bad for a beta release! The vmc command line detects that the application I wish to deploy is a Spring-powered one and starts a Redis instance for me. As simple as that. Once the application gets successfully "pushed" to the cloud, it is immediately available on Cloud Foundry. You may have also spotted the "Memory Reservation" configuration. Currently, Cloud Foundry permits to allocate up to 2GB of memory _per_ application


## Some considerations


The Cloud Foundry platform "feels" very stable and reliable, remarkable for a week old beta release. I was able to deploy both a Java and a RoR application on the first attempt. The thing just works!


Clearly there are some aspect that will probably have to change in the future in order for Cloud Foundry to become a realistic competitor to other cloud-based services:


    
*   **No file system access**. This deficiency can be a show-stopper for IO heavy applications. There is always the possibility to use some other cloud based storage system, such as Amazon S3\. It is also likely that VMware will roll out their own cloud based storage application. Also, Redis and MongoDB can - in some cases - replace a file system.
*   **Limited outbound traffic**. Only HTTP and HTTPs outbound connections are allowed at the moment. That means that, for instance, it is not possible to send an email by connecting to an SMTP server (even though it is still possible to use a service like [SendGrid][8]). Again, it is likely that CF will offer an email sending service in the future.
*   **Extreme abstraction**. The platform is indeed very stable but coming from a cloud service like Amazon AWS you feel a bit "insulated". Logs are a bit awkward to read (`vmc logs app-name`) and it seems impossible at the moment to configure/tune the data storage - MySQL or Redis
*   **Scaling**. It is not clear how Cloud Foundry will support horizontal scaling. Scaling is a key factor in order for CF to compete against more established cloud providers.
*   **Lack of a web interface**. I didn't get a chance to test the SMS Eclipse plugin, which looks very promising - UI-wise. A Web interface to control deployed applications and services would be palatable.
    

## Spring integration notes


The sample application I have developed for testing out Cloud Foundry is a very basic Spring MVC application. As mentioned early, it does use the new Spring Data project to abstract away the Redis integration. It also uses JQuery and JSON to send data back and forth.


I was able to deploy the application on Cloud Foundry easily but I have stumbled in a couple of Redis related issues I'd like to report.


When a service as Redis is created on Cloud Foundry it get automatically bound to a deployed application. I couldn't find a way to detect on which port a Redis instance is running. Therefore, on the first deploy my application thrown a `java.net.ConnectException: Connection refused` exception because I was assuming Redis to run on the default port (6379) and obviously it wasn't. It took me quite a while to figure out how to connect to a Cloud Foundry hosted Redis instance. The "ah-ah" moment stroke me after spending some time studying the [source code][9] of the demo applications released by the Cloud Foundry team.


Cloud Foundry released a library named `cloudfoundry-runtime` that is needed to connect to running instances of data services hosted in the CF infrastructure. The library also adds a new "cloud" xml namespace used in the Spring beans configuration. These tags, along with the new Spring 3.1 [beans profile][10] configuration permits to configure an application so that it can be deployed in the CF ecosystem and in a standard container (Jetty, in my case).

```java
public class CloudApplicationContextInitializer implements ApplicationContextInitializer {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        CloudEnvironment env = new CloudEnvironment();
        if (env.getInstanceInfo() != null) {
            System.out.println("cloud API: " + env.getCloudApiUri());
            applicationContext.getEnvironment().setActiveProfiles("cloud");
        }
        else {
            applicationContext.getEnvironment().setActiveProfiles("default");
        }
    }
}
```

 

```java
import org.cloudfoundry.runtime.env.CloudEnvironment;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;

public class CloudApplicationContextInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        CloudEnvironment env = new CloudEnvironment();
        if (env.getInstanceInfo() != null) {
            System.out.println("cloud API: " + env.getCloudApiUri());
            applicationContext.getEnvironment().setActiveProfiles("cloud");
        }
        else {
            applicationContext.getEnvironment().setActiveProfiles("default");
            System.out.println("Default env");
        }
    }

}
```


The `CloudApplicationContextInitializer` class uses the `CloudEnvironment` object to detect if the application is running in or outside Cloud Foundry. At lines 9 and 11, the new Spring profile name is set.

```xml
<bean  id="redisTemplate" class="org.springframework.data.keyvalue.redis.core.StringRedisTemplate"
        p:connection-factory-ref="redisConnectionFactory"/>

<beans profile="default">
    <bean id="redisConnectionFactory" class="org.springframework.data.keyvalue.redis.connection.jedis.JedisConnectionFactory" 
    p:host-name="${redis.host}" p:port="${redis.port}" p:password="${redis.pass}"/>
</beans>

<beans profile="cloud">
    <cloud:redis-connection-factory id="redisConnectionFactory"/>
</beans>
```


Finally, in the Spring configuration file we specify two Redis connection factories, one activated when the profile is set to "default" and the other when the profile is set to "cloud". The profile "trick" is not needed to deploy the application in Cloud Foundry but it gets very handy in order to deploy the web app also in a standard container.


[0]: http://www.cloudfoundry.com/
[1]: http://support.cloudfoundry.com/home
[2]: https://github.com/aestasit/cloudfoundry-testdrive-app
[3]: http://aestas-cloudfoundry-demo.cloudfoundry.com/
[4]: http://redis.io/
[5]: http://twitter.com/#!/antirez
[6]: http://www.springsource.org/spring-data
[7]: https://github.com/aestasit/cloudfoundry-testdrive-app/
[8]: http://sendgrid.com/
[9]: https://github.com/SpringSource/cloudfoundry-samples/wiki/Spring-hello-sample-application
[10]: http://blog.springsource.com/2011/02/14/spring-3-1-m1-introducing-profile/