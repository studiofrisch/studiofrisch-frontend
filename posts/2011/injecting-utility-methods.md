---

title: Injecting Utility Methods in Gradle Projects Using Plugin Conventions
date: 2011-06-28
author: 1
bio: The guy behind Extreme Automation. Writes about DevOps, automation, enterprise processes, open-source, start-up life. Travels the world.
description: "Gradle is a very flexible build framework that allows to implement most complex and custom build requirements. It combines a great level of pluggability with a clear API and power of Groovy] programming langauge. There are a lot of great articles about Gradle and the documentation on Gradle site is just awesome. In this blog we will try to show one interesting aspect of extending Gradle build."

---

[Gradle][0] is a very flexible build framework that allows to implement most complex and custom build requirements. It combines a great level of [pluggability][1] with a [clear API][2] and power of [Groovy][3] programming langauge. There are a lot of [great articles][4] about Gradle and the [documentation][5] on Gradle site is just awesome. In this blog we will try to show one interesting aspect of extending Gradle build.

As Gradle build script is basically a Groovy script, you can easily add utility methods to it and reuse them in your tasks. Consider the following simple `build.gradle`:

```groovy
// Prepare task
task prepare << {

  printMessage()

  // Prepare ...
}

// Build task
task build (dependsOn : ['prepare']) << {

  printMessage()

  // Build ...
}

def printMessage() {
  println "Message from " + project.name
}
```

Though when your script grows and when you need to modularize your script using ["apply from"][6] construct, you will soon realize that utility methods are private to the script and are invisible to other scripts. This becomes even bigger problem if you need to reuse some of the functionality in several independent builds.

Luckily, this can be easily overcome by using Gradle plugin API and plugin conventions. Plugin can be implemented in Gradle itself and reside in the same directory as your main script. Below you can find contents of `utilities.gradle` which holds `UtilitiesPlugin` implementation:

```groovy

// This line will enable our plugin for
// the build that imports this script.
apply plugin: UtilitiesPlugin

/**
 * This is a plugin.
 */
class UtilitiesPlugin implements Plugin {

  def void apply(Project project) {
   project.convention.plugins.utilities =
     new UtilitiesPluginConvention(project)
  }

}

/**
 * Plugin convention class.
 */
class UtilitiesPluginConvention {

  private Project project

  public UtilitiesConvention(Project project)  {
    this.project = project
  }

  /* DEFINE YOUR UTILITY METHODS HERE */

  def printMessage() {
    println "Message from " + project.name
  }

  ...

}

```

This may look a bit too much for a simple `printMessage` method, but it's all just to show the principle. The magic is in the fact that all public methods in `UtilitiesPluginConvention` class will be available to your build script (and to its child scripts in case of multi-project build) as soon as you include `utilities.gradle` using `apply` keyword:

```groovy
apply from: "utilities.gradle"

// Prepare task
task prepare << {

  printMessage()

  // Prepare ...
}

// Build task
task build (dependsOn : ['prepare']) << {

  printMessage()

  // Build ...
}

```

The example above is, of course, very simplistic, but we hope it shows the possibilities of modularizing your Gradle builds with the help of plugin convention objects. In next posts we will try to talk more about organising and extending Gradle builds.


[0]: http://www.gradle.org/
[1]: http://www.gradle.org/standard_plugins.html
[2]: http://www.gradle.org/1.0-milestone-2/docs/dsl/index.html
[3]: http://groovy.codehaus.org/
[4]: http://www.javaexpress.pl/article/show/Gradle__a_powerful_build_system?lang=en
[5]: http://www.gradle.org/documentation.html
[6]: http://www.gradle.org/1.0-milestone-2/docs/userguide/tutorial_this_and_that.html#sec:configuring_using_external_script
