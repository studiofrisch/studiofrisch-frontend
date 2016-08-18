### How to build

- Install `node.js` from <http://nodejs.org/download/>.
- Install `gulp` by running `npm install gulp -g`.
- Fetch `node.js` modules by running `npm install`.
- Build website by running `gulp build`.

### Development

To start developing, just run `gulp` and local web server will start on port `8080`. Page should open automatically, if not go to <http://localhost:port> in your browser. There is also a shortcut to start gulp if you are on Windows. 

### Guide

Most things are straight forward, but here are some things you might not know:

 * Each cheat sheet in JSON have to have "slug" attribute (this used as ID and should be URL/SEO friendly). 
 * Posts need to have "bio" field for a small author description.
 * Don't use "two tabs" for code blocks, use "three ` " because code "two tabs" indicate soemthing else and will not style code properly.
 * Use "workshop: true" in events.json to indicate that speech also has a workshop.
 * Use "draft: true" in posts to indicate that it is still a draft.
