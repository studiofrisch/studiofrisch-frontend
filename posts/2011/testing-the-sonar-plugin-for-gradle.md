---

title: Testing The Sonar Plugin for Gradle
date: 2011-10-28
author: 2
description: "If you were looking to convince your boss that Gradle is worth a try for your next project, look no further."

---

If you were looking to convince your boss that [Gradle][0] is worth a try for your next project, look no further.

Gradle 1 release candidate 5, released on October 25, brings the long awaited [Sonar][1] integration, and it works ridiculously well. How well? How about a one-liner?

Sonar is the standard static code analysis platform that aims at improving the quality of code, any code. It blends many well known open source analysis tools such as [Findbugs][2], [PMD][3], [Checkstyle][4], [Cobertura][5] into an impressive dashboard. If you learn to read and appreciate the metrics, Sonar becomes quickly a crucial tool in any software project that has interest in quality.

[![Sonar2](http://aetomation.aestasit.com/img/blog/2011/10/sonar2.jpg)][17]

This is Sonar showing the metrics for the latest version of the [Guava][6] project.

Before the latest release of Gradle, it was _[almost][7]_ impossible to integrate a Gradle build with Sonar. The option was of course to integrate each static code analysis tool into the build and resort to [Jenkins][8] for displaying the metrics in a dashboard-like fashion. Still, several out-of-the-box Sonar features were simply not available without a lot of configuration wrestling (for instance, multi-project aggregation). In other words, with Gradle it was time consuming to setup all the static code analysis tools offered "for free" by Sonar.

### Enter the Sonar plugin

When the news of a fresh release of Gradle hit the twitter-sphere, I was thrilled to see the "Improved Sonar plugin" entry in the [release notes][9]. So I decided to test it straight away.

After installing the new Gradle release, I have cloned the Guava project from Git. Guava has five sub projects and a small code base, perfect for my testing purpose. It took me 10 minutes to convert Guava's Maven POMs into laughably short Gradle scripts. That is how the main build script for Guava looks like:

```groovy

allprojects  {
  apply plugin: 'java'
  apply plugin: 'maven'

  group = 'com.google.guava'
  version = 'latest'

  configurations.compile.transitive = true
}

subprojects {
  apply plugin: "sonar"
  sourceCompatibility = 1.5
  targetCompatibility = 1.5

  repositories {
    mavenCentral()
    mavenRepo urls: "https://oss.sonatype.org/content/repositories/snapshots"
    mavenRepo urls: "https://raw.github.com/truth0/repo/master"
  }
    
  sourceSets {
    main {
      java {
        srcDir 'src'
      }
    }
  }
}

dependsOnChildren()

```


Did you notice the use of the new Sonar plugin at line 12? That's pretty much what it takes to start feeding Sonar with the static code analysis metrics. Yes, seriously. The plugin definition is placed in the Guava master build script and it's applied to all the sub-projects. 

### The 30 seconds guide to get started with Sonar
    
1.  [Download][10] Sonar
2.  Unzip it
3.  Run the appropriate start script for your platform located in the \bin folder.

Done? Open your browser at [http://localhost:9000/][11] and you should see the Sonar console. What you are running now is a vanilla setup that uses the default embedded database (Derby). Sonar should use more a more robust database when used for anything else than a 5 minutes test. Check out the sonar.properties file for a list of supported databases.

### Analyze this!

The Sonar plugin adds the `gradle sonarAnalyze` task to the project. So, all I have to do to feed Sonar with metrics is to run

```bash

gradle sonarAnalyze

```

When the build is over, I can check the result on the Sonar page. The five Guava projects have been analyzed and metrics are ready. The build doesn't include a test coverage tool (such as [Cobertura][5], [Jacoco][12] or [Clover][13], all [supported][14] by Sonar). If I had one I could have fed Sonar with the result of the test coverage analysis as well. **109668** is the staggering number of tests Guava comes with.

Here is an example of how to configure the plugin to read the Cobertura results.

```groovy
sonar {
  project {
    coberturaReportPath = file("$buildDir/cobertura.xml")
  }
}
```

The plugin documentation [page][15] has very detailed instructions on how to configure the plugin for different scenarios.

A cloned version of the Guava libraries that uses Gradle to build is available [here][16].

[0]: http://www.gradle.org/
[1]: http://www.sonarsource.org/
[2]: http://findbugs.sourceforge.net/
[3]: http://pmd.sourceforge.net/
[4]: http://checkstyle.sourceforge.net/
[5]: http://cobertura.sourceforge.net/
[6]: http://code.google.com/p/guava-libraries/
[7]: http://codewader.blogspot.com/2011/02/gradle-friends-with-sonar.html
[8]: http://jenkins-ci.org/
[9]: http://wiki.gradle.org/display/GRADLE/Gradle+1.0-milestone-5+Release+Notes
[10]: http://www.sonarsource.org/downloads/
[11]: http://localhost:9000/
[12]: http://www.eclemma.org/jacoco/
[13]: http://www.atlassian.com/software/clover
[14]: http://www.sonarsource.org/pick-your-code-coverage-tool-in-sonar-2-2/
[15]: http://gradle.org/current/docs/userguide/userguide_single.html#sonar_plugin
[16]: https://code.google.com/r/lucianofiandesio-gradle/ "Guava Gradle clone"

[17]: http://aetomation.aestasit.com/img/blog/2011/10/sonar2.jpg