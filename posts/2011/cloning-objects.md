---

title: "Cloning objects in WLST (offline)"
date: 2011-06-28
author: 1
bio: The guy behind Extreme Automation. Writes about DevOps, automation, enterprise processes, open-source, start-up life. Travels the world.
description: "Recently, I have faced a limitation of WLST that does not allow you to clone a managed object (e.g. machine or server) in a script. Clone button is available in WebLogic Administration Console, but WLST lacks that convenient function. Googling didn't give much results and thus I decided to write my own script to perform this in a generic way."

---

Recently, I have faced a limitation of WLST that does not allow you to clone a managed object (e.g. machine or server) in a script. Clone button is available in WebLogic Administration Console, but WLST lacks that convenient function. Googling didn't give much results and thus I decided to write my own script to perform this in a generic way.

First of all let's start with some setup scripts that I used on my Linux environment. For convenience purposes, I have created a script called `wlst` inside `/usr/bin`:

```bash
#!/bin/bash

. /etc/profile.d/common.sh

$JAVA_HOME/bin/java \
       -Dpython.path=/var/bea/common \
       -Dpython.cachedir=/tmp \
       -cp $WL_HOME/server/lib/weblogic.jar \
       weblogic.WLST "$@"

```

As you may notice it starts WLST with 2 additional properties: `python.path` and `python.cachedir`. Value given to `python.path` variable just specifies a directory where WLST will search for additional modules. This allows modularizing of WLST scripts and putting common functions into a common Python library. You will find more details about it later in this blog. python.cachedir is set to a directory that is writable by everyone and that keeps the cache of compiled Python scripts.

Also the `common.sh` script imported in the beginning just contains some common environment variable definitions reused in many of my other scripts:

```bash
...
export WL_HOME=/opt/bea/weblogic92
export NODEMGR_HOME=/var/bea/nodemanager
export JAVA_HOME=/opt/bea/jrockit-jdk1.5.0_24-R28.1.0-4.0.1
...

```

Now, let's look at the interesting part. The following script creates a new server and copies properties from already existing server that resides in my domain template.

```python

############################################################
#    Name:         create_portal_domain.py
#    Version:      1.0
############################################################

import sys
from domain_functions import *

...

  cd("/")
  create('PortalServer2', 'Server')
  copyProperties(WLS,
                 'PortalServer1',
                 '/Servers',
                 'PortalServer2',
                 '/Servers',
                 ['SSL'])

...
```

As you can see that script calls `copyProperties` function that is not defined in standard WLST. The function is imported from `domain_functions.py` which lies in a common folder and, thanks to `python.path` setting, it is available to the script.

The `copyProperties` function looks like this:

```python

############################################################
# Copies bean properties (offline)
############################################################
def copyProperties(wls,
                   originalBeanName,
                   originalBeanPath,
                   newBeanName,
                   newBeanPath,
                   ignoredProperties):

  wls.getCommandExceptionHandler().setMode(1)
  wls.getRuntimeEnv().set('exitonerror', 'true')

  srcPath = originalBeanPath + "/" + originalBeanName
  targetPath =  newBeanPath + "/" + newBeanName

  print "Coping properties from " +
          srcPath + " to " + targetPath
  wls.cd(srcPath)

  wls.setShowLSResult(0)
  attributes = wls.ls('a', 'true', 'a')
  children = wls.ls('c', 'true', 'c')
  wls.setShowLSResult(1)

  # Copy attributes.
  wls.cd(targetPath)
  for entry in attributes.entrySet():
    k = entry.key
    v = entry.value
    if not(k in ignoredProperties) and
       not(v is None) and
       not(v == ''):
      print "Setting property " + str(k) + " = " +
             str(v) + " on " + targetPath
      if isinstance(v, StringType):
        wls.set(k,
                v.replace(originalBeanName, newBeanName))
      else:
        wls.set(k, v)

  # Copy child bean values.
  for k in children:
    if not(k in ignoredProperties):
      srcBN = srcPath + "/" + k
      targetBN = targetPath + "/" + k
      print "Coping bean " + srcBN + "/" + originalBeanName
      print "Detected bean type as " + k
      if beanExists(wls, srcBN, "NO_NAME_0"):
        print "Changing to NO_NAME_0"
        originalBeanName = "NO_NAME_0"
        newBeanName = "NO_NAME_0"
      wls.cd(targetPath)
      wls.create(newBeanName, k)
      copyProperties(wls,
                     originalBeanName,
                     srcBN,
                     newBeanName,
                     targetBN,
                     ignoredProperties)

############################################################
# Checks bean existence.
############################################################
def beanExists(wls, path, name):
  print "Checking if bean: " + name +
         " exists in path: " + path
  wls.cd(path)
  wls.setShowLSResult(0)
  beans = wls.ls('c', 'false', 'c')
  wls.setShowLSResult(1)
  if (beans.find(name) != -1):
    print "Exists"
    return 1
  else:
    print "Doesn't exist"
    return 0

```

Works like a charm!

