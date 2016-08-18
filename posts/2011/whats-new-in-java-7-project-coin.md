---

title: "What's New in Java 7 - Project Coin"
date: 2011-08-08
author: 2
description: "Last week, Oracle has released the 7th incarnation of the Java Platform, Java 1.7.0. Lets see what's new?"

---

Last week, Oracle has released the 7th incarnation of the Java Platform, Java 1.7.0.

The list of language changes is broad, with some very welcome features (such as the InvokeDynamic stuff and Doug Lea's ForkJoin framework) and some syntax sugar. A lot of people were hoping to see Closures as part of the platform, but it looks like they will have to wait 2012, when Java 8 will be out.

In the following posts, we plan to cover some of the most interesting aspects that have been added to the Java platform, starting from [Project Coin][0].

Project Coin started in 2009 with the goal to determine what set of small language changes should be added to JDK 7. The language's enhancements are:

    
* Strings in switch statements
* try-with-resources statement
* improved type inference when declaring generics ("diamond")
* Simplified varargs method invocation
* Better integral literals
* Improved exception handling (multi-catch)
    


So, let's crack some code and take a look at each of these new features.

### Strings in switch statements
In 1995, a developer named Laura, opened a [bug][1], complaining that the Switch statement was too limited in Java 1\. A mere 16 years later, they listened to her!

Here is how the new switch statement looks like:

```java
public static void main(String[] args) {
    final String color = "red";
    switch (color) {
        case "red":
            System.out.println("IS RED!");
            break;
        case "black":
            System.out.println("IS BLACK");
            break;
        case "blue":
            System.out.println("IS BLUE");
            break;
   }
}
```

Running [javap][2] against this simple code yields some surprise.

```rebol
d:\JVMs\jdk1.7.0\bin\javap.exe -v -classpath classes com.aestasit.java7.StringSwitch > javapOut/switch7.txt
```

```bash
public static void main(java.lang.String[]);
    flags: ACC_PUBLIC, ACC_STATIC

    Code:
      stack=2, locals=4, args_size=1
        ...
        12: lookupswitch  { // 4

                  112785: 56

                 3027034: 84

                93818879: 70

                98619139: 98
                 default: 109
            }
        56: aload_2
        57: ldc           #2                  // String red
        ...
       110: tableswitch   { // 0 to 3

                       0: 140

                       1: 151

                       2: 162

                       3: 173
                 default: 181
            }
       140: getstatic     #8                  // Field java/lang/System.out:Ljava/io/PrintStream;
       143: ldc           #9                  // String IS RED!
       ...
       181: return
```

What are we looking at here? (the complete disassembled code is available on [Gist][3])? The simple String switch statement generates two set of instructions: an expected "**lookupswitch**" and a not so expected "**tableswitch**".

The initial "**lookupswitch**" instruction is used to match the hashcode of the case statements. The large numbers under "**lookupswitch**" are actually the hashcodes of the string in the case statements.

The instructions before the "**tableswitch**" are used to do a string comparison between the matched hashcode, in the unlikely case that two strings have the same hashcode. Finally, once the match is confirmed, the the code to be executed for the matched case statement is reached via the "**tableswitch**" instruction.

### try-with-resources statement

Historically, Java has been criticized for being a verbose and ceremonious language. This is how you open a file and read it into a List in Java:
```java

BufferedReader in = null;
try {
    in = new BufferedReader(new FileReader("myfile.txt"));
    List<String> myList = new ArrayList<String>();
    String str;
    while ((str = in.readLine()) != null) {
        myList.add(str);
    }
    return myList;
} catch (Exception e) {
    e.printStackTrace();
} finally {
    if (in != null) {
        try {
            in.close();
        } catch (IOException e) {
            e.printStackTrace(); 
        }
    }
}
```

To do something similar, say in Scala:

```java
import scala.io.Source._
val lines = fromFile("file.txt").getLines
```


It is indeed silly to compare Java and Scala in this way. Still, the Java code is very verbose. The new try-with-resources is a small step into getting rid of some lines of code when dealing with resources that have to be closed before disposing them. When using try-with-resource you declare the resource that has to be automatically closed after the program has finished with it. The auto-closing mechanism is only available for resources that implement the new [][4] interface.
This is out the code looks like when using the new feature:
```java
try (BufferedReader in  = new BufferedReader(new FileReader("myfile.txt"))) {
    List<String> myList = new ArrayList<>();
    String str;
    while ((str = in.readLine()) != null) {
        myList.add(str);
    }
    return myList;
} catch (Exception e) {
    e.printStackTrace();
}
```

### Improved type inference when declaring generics ("diamond")
This is another step into removing some verbosity from the language. It's a tiny step but can cut some editing on large code bases. Generics in 1.5 and 1.6 enforce type redundancy during declaration:
```java
List<String> myList = new ArrayList<String>();
```
With the 1.6 language support is possible to use this construct:
```java
List<String> myList = new ArrayList<>(); // Diamond!
```

Personally, I have been a huge fan of Google's [Guava library][5] that has attempted to save some keystrokes when dealing with generics for quite a long time now:
```java
// Using Guava
List<String> myList = Lists.newArrayList();
```
The Java 1.7 approach is obviously more elegant and less goofy.

### Simplified varargs method invocation

Generics in Java have a bit of a mixed reputation. The main issue with Generics is that they are not "reified", meaning that when the code is compiled we loose the type information (the reason for that is backward compatibility)

A side effect of non-reified Generics is that when calling a varargs method, the compiler issues a weird compilation warning. Take this Java 1.5 code:
```java
public static void main(String[] args) {
    print("a", "b", "c");
    print(new Pair<Integer,String>(1,"One"), new Pair<Integer,String>(2,"Two")); // Compiler warning
}

//varargs method
public  static <T> void print(T... a) {
    for (T t : a) {
         System.out.println(t);
    }
}

static class Pair<T,E> {
    public Pair(T i, E a) {
    }
}
```

The compiler issues this warning:
```bash
warning: [unchecked] unchecked generic array creation of type com.aestasit.Pair<java.lang.Integer,java.lang.String>[] for varargs parameter
        print(new Pair<Integer,String>(1,"One"), new Pair<Integer,String>(2,"Two"));
             ^
```

The reason of the warning is explained in a lot of details [here][6] but it boils down to the fact that Arrays in Java are not reified.

In the JDK7, the warning has been moved from the invocation code to the varargs method and it is now possible to annotate the varargs method with a @SafeVarargs
annotation in order to suppress the warning.
```java
@SafeVarargs
// WARNING SUPPRESSED: Type safety: Potential heap pollution from paramterized vararg type
public static <T> void print(T... a) {
  for (T t : a) {
      System.out.println(t);
  }
}
```

I can see that this feature may be useful on large code bases to reduce the amount of warnings, but it's definitively not the most exciting feature that made into Java 7\.

### Better integrals literals

Here is another minor improvement that helps the readability of large numbers. It is now possible to use underscores "\_" to separate digits:
```java
int aBigNumber = 1_000_000_000;
float aFloat = 10.20_111f;
```

A small gotcha: numbers must start and finish with a digit.
For the real geeks out there, Java 7 allows to express integer literals in binary form. The Oracle [page][7] on "Binary Literals" is quite explanatory on this subject.

### Improved exception handling

This is a cool, little new feature that will drastically cut some lines of code. In Java 7 it's now possible to catch multiple exceptions using the pipe "|" separator:
```java
try {
    ....
} catch (IOException|SQLException ex) {
    log(ex);
    throw ex;
}
```

Another small gotcha: when catching multiple exception types, the `catch` parameter is `ex` is final, therefore the variable can not be reassigned.


[0]: http://jcp.org/en/jsr/detail?id=334 "JSR 334"
[1]: http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=1223179 "Switch statement bug"
[2]: http://download.oracle.com/javase/6/docs/technotes/tools/windows/javap.html "javap utility"
[3]: https://gist.github.com/1127487 "Decompiled code"
[4]: http://download.oracle.com/javase/7/docs/api/java/lang/AutoCloseable.html "java.lang.AutoCloseable"
[5]: http://code.google.com/p/guava-libraries/ "Guava"
[6]: http://www.angelikalanger.com/GenericsFAQ/FAQSections/ProgrammingIdioms.html#FAQ300 "varargs"
[7]: http://download.oracle.com/javase/7/docs/technotes/guides/language/binary-literals.html "Binary Literals"