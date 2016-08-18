---

title: "What's New in Java 7 - The Forkjoin Framework"
date: 2011-10-21
author: 2
description: "One of the most interesting features introduced in Java 7 is the new Fork/Join framework (JSR-166)."

---

One of the most interesting features introduced in Java 7 is the new Fork/Join framework (JSR-166).

CPUs are not getting any faster so manufacturers are adding more cores to the processors. That means that single-threaded applications are not able to leverage the "parallelization" offered by a multi-core processor. But how to put those cores to work?

The concept of "parallelization" is based on the assumption that often large problems can be divided into smaller ones, which are solved "in parallel". The smaller tasks can be assigned to the CPU's cores.

Concurrent programming is not easy, mostly because of synchronization issues and the pitfalls of shared data. Historically Java has offered an excellent support for multi-threaded programming, partially shielding the developer from the complexity of writing code that runs many tasks in parallel.

The last addition to the arsenal of the Java Concurrent programmer is the Fork/Join framework. Fork-join parallelism offers an elegant programming model ([Divide and Conquer][0]) to distribute a compute-intensive problem across available CPU cores. The Divide and Conquer algorithm uses recursion to break down a task in many smaller, dis-patchable tasks.

The Fork/Join framework it is similar to the more famous Google's [MapReduce][1]. The main difference is that Fork/Join is designed to run on a single JVM while MapReduce supports the distribution of the tasks to a cluster of machines.

An interesting design aspect of Fork/Join is the "work-stealing" algorithm: worker threads that run out of things to do can steal tasks from other threads that are still busy.

The principal classes of the Fork/Join framework are:
    
*   `[ForkJoinPool][2]` This is the ExecutorService where tasks are run in parallel. The default parallelism level is the number of processors available to the runtime.
*   `" href="http://download.oracle.com/javase/7/docs/api/java/util/concurrent/RecursiveTask.html" target="_blank"RecursiveTask` This is a task, subclass of the [ForkJoinTask][3] which can return some value of type V. For example processing a list of DTOs and returning the result of process.
*   `[RecursiveAction][4]` Another subclass of the ForkJoinTask without any return value, useful when processing tasks that don't return any value.
    
Enough with the theory. Now let's take a look at how we can put the Fork/Join framework in practice.

An interesting domain that benefits from parallelism is the indexing of documents. The standard fulltext indexing and search library in Java is the 10 years old **[Apache Lucene][5]** project. Lucene is used by companies all over the world for data searching purposes (Twitter, for instance, [uses][6] Lucene for real-time search on petabytes of data).

Lucene needs to create an index (actually an [inverted index][7]) of the data before it can search it. On large data sets, the standard indexing process can be slow. Each document (say millions of Word documents, ouch!) has to be analyzed and data have to be written to the index.

This sounds like a perfect case for applying our newly discovered Fork/Join framework.
_

Obviously, there are other ways to parallelize the creation of a Lucene index. 

*   Running multiple threads with a single IndexWriter
*   Index to separate indexes and then merge
*   Use Hadoop or [Katta][8]
*   Wait for Lucene 4.0

The following snippet of Java shows some vanilla code to create a Lucene index out of a folder containing some documents:

```java

File docDir = new File("/home/aestas/docs"); // directory where the files to index are located
Directory fsDir = FSDirectory.open("/home/aestas/index"); // directory where indexes are stored
IndexWriterConfig conf = new IndexWriterConfig(Version.LUCENE_31, new LimitTokenCountAnalyzer(new StandardAnalyzer(Version.LUCENE_31), 1000));

IndexWriter indexWriter = new IndexWriter(fsDir, conf);

for (File f : docDir.listFiles()) {
  final String text = fileToString(file);
  Document d = new Document();
  d.add(new Field("file", fileName, Field.Store.YES, NOT_ANALYZED));
  d.add(new Field("text", text, Field.Store.YES, ANALYZED));
  indexWriter.addDocument(d);
}
indexWriter.close();

```

The code is pretty straightforward (we are not going to delve into the Lucene API that much). The class `[IndexWriter][9]` is responsible for actually writing the index into the `fsDir` directory. For each document found in the `docDir` folder, a new Lucene Document is created and added to the index.
Finally the index is closed and data flush to disk.

The Fork/Join framework will sprinkle some concurrency over our indexing process. The Divide and Conquer approach dictates that we have to split out task into smaller tasks. In this specific case, we figure out how many documents we have to index and, if the number is higher of a certain threshold, we partition the files in smaller groups and we index them concurrently. Easy!

The first change is to create an `Indexer` class that extends `RecursiveAction`. RecursiveAction is a subclass of `ForkJoinTask ` and does not return any value.

```java

public class Indexer extends RecursiveAction {
  private IndexWriter indexWriter;
  private List files;
  private final static int BATCH_SIZE = 200;

  public Indexer(IndexWriter iw, List filez) {
    this.indexWriter = iw;
    this.files = filez;
  }

  @Override
  protected void compute() {
     if (files.size() > BATCH_SIZE) {
       List tasks = new ArrayList<>();
       List partitioned = Lists.partition(files, BATCH_SIZE);
       for (List sublist : partitioned) {
          tasks.add(new Indexer(indexWriter, sublist));
       }
       invokeAll(tasks);
     } else {
       // No parallelism
       for (File f : files) {
         try {
           indexFile(f, indexWriter);
         } catch (IOException e) {
           // DO something with exception...
         }
       }
     }
  }

  private String fileToString(File file) throws IOException {
    return Files.toString(file, Charsets.UTF_8);
  }

  private void indexFile(File file, IndexWriter _indexWriter) throws IOException {
    String fileName = file.getName();
     final String text = fileToString(file);
     Document d = new Document();
     d.add(new Field("file", fileName, Field.Store.YES, NOT_ANALYZED));
     d.add(new Field("text", text, Field.Store.YES, ANALYZED));
     _indexWriter.addDocument(d);
  }
  
}

```

The inherited `compute()` function contains most of the stuff we are interested in. First the code checks if the number of files to index is higher than a threshold (`BATCH_SIZE` variable). If it's the case, the list of files get partitioned in sub-lists, each sub-list having the size of the `BATCH_SIZE` value.

If you wonder what is the `[Lists.partition][10]` method, check out the super-useful [Guava library][11] from Google.

Finally, the sub-lists get processed by the `invokeAll()` method. `invokAll()` performs the most common form of parallel invocation: forking a set of tasks and joining them all.

The `ForkJoinClass` also exposes `fork()` and `join()` methods that come handy when using a `RecursiveTask` and the resulting computation of the task is needed.

The last bit of our simple example actually involves the invocation of the indexing task:

```java

private final ForkJoinPool forkJoinPool = new ForkJoinPool(2);

File docDir = new File("/home/aestas/docs"); // directory where the files to index are located
Directory fsDir = FSDirectory.open("/home/aestas/index"); // directory where indexes are stored
IndexWriterConfig conf = new IndexWriterConfig(Version.LUCENE_31, new LimitTokenCountAnalyzer(new StandardAnalyzer(Version.LUCENE_31), 1000));
IndexWriter indexWriter = new IndexWriter(fsDir, conf);

forkJoinPool.invoke(new Indexer(indexWriter, Lists.newArrayList(docDir.listFiles())));

indexWriter.optimize();
indexWriter.close();

```

The `ForkJoinPool` class is initialized with a target parallelism. The default value is the number of available processors. Then we initialize the Lucene `IndexWriter` as usual and we simply pass to the `ForkJoinPool` an `Indexer` task containing the list of files to index.

Using a very elegant recursive approach, the files will be concurrently processed in batch by the available cores.

### Performance

The performance gain achieved by the Fork/Join framework is noticeable. I have downloaded [8488 txt files][12] - for a grand total of 211Mb of data - and run the indexing process against these files.

The test machine is a Lenovo T500 laptop, dual core 2.80Ghz CPU and 8 Gb Ram. OS is Windows 7 64bit.

Here are the results:
[![](http://aetomation.aestasit.com/img/blog/2011/10/performances.jpg)][13]

The single-threaded indexing process took an average of 11872 milliseconds. By applying a recursive, parallel approach and using the 2 cores and a batch size of 500 files/core the indexing time decreased 19%.

I had a 37% speedup by taking advantage of the Lucene's "merge" feature. Each batch of file is indexed in a separate index and at the end of the files processing all the "sub-indexes" are merged in one large index.

The speedup would have been even higher on a machine with more cores. According to [this][14] paper from Oracle, the speedup is near-linear when the number of cores increases.

The complete code to reproduce these tests is available on [Github][15]. It requires Gradle to run the tests from the command line. For convenience, I have also uploaded [an archive][16] with more than 8000 txt files that can be used for testing out the indexing process.


[0]: http://en.wikipedia.org/wiki/Divide_and_conquer_algorithm "Divide and Conquer"
[1]: http://en.wikipedia.org/wiki/MapReduce "MapReduce"
[2]: http://download.oracle.com/javase/7/docs/api/java/util/concurrent/ForkJoinPool.html "ForkJoinPool"
[3]: http://download.oracle.com/javase/7/docs/api/java/util/concurrent/ForkJoinTask.html "ForkJoinTask"
[4]: http://download.oracle.com/javase/7/docs/api/java/util/concurrent/RecursiveAction.html "RecursiveAction"
[5]: http://lucene.apache.org/java/docs/index.html "Apache Lucene"
[6]: http://www.lucidimagination.com/devzone/events/video-realtime-search-lucene-presented-michael-busch-twitter "Twitter and Lucene"
[7]: http://en.wikipedia.org/wiki/Inverted_index "Inverted Index"
[8]: http://katta.sourceforge.net/ "Katta"
[9]: http://lucene.apache.org/java/3_4_0/api/core/org/apache/lucene/index/IndexWriter.html "IndexWriter"
[10]: http://guava-libraries.googlecode.com/svn/trunk/javadoc/com/google/common/collect/Lists.html#partition%28java.util.List,%20int%29 "Lists.partition"
[11]: http://code.google.com/p/guava-libraries/ "Guava Libraries"
[12]: http://textfiles.com/ "textfiles.com"
[13]: http://aetomation.aestasit.com/img/blog/2011/10/performances.jpg
[14]: http://www.oracle.com/technetwork/articles/java/fork-join-422606.html "Fork and Join: Java Can Excel at Painless Parallel Programming Too!"
[15]: https://github.com/aestasit/ForkJoinExample "Github"
[16]: http://aestasit.com/files/txt_files.rar "TXT Files archive"