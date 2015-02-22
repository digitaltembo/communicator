# communicator
a firefox add-on to let people style their web-based communication

Share **code**! Share **math**, and **physics**, and **equations**,  and share it in your style!!!
![some pictures](http://dijitalelefan.com/projects/communicator/communicator1.jpg) ![of communicator in action](http://dijitalelefan.com/projects/communicator/communicator2.png)

It's all very exciting

It even degrades in style, with a *[fleuron](http://en.wikipedia.org/wiki/Fleuron_%28typography%29),* because fleurons are excellent: ![look at that fleuron](http://dijitalelefan.com/projects/communicator/communicator3.png)

***

Usage
---
It is simple to use: when typing a message in Facebook (the only website supported so far), simply press Ctrl-Shift-'/' to enter into the communicator mode. This will append a fleuron to the end of the message and let you type the tab key within the textarea. Then, 

a) if you want to put code into your message, wrap it in \`\`\` deliminiters or in a ```<code> </code>``` block.

b) if you want to put an equation in your message, you have a choice of using ```<eq></eq>``` blocks, or any of ```$$ math. $$```, ```\[ math. \]```, or ```\( math. \)```.

c) lastly, you can always just put any markdown into your messages. As facebook already fiddles with links, nothing has been done with them yet, and as of right now I don't really like the spacing in the generated markdown, but it more or less works.

Then, upon sending the message, it will be rendered by anyone reading it who is using the plugin!

***
How it works
---
Under the hood, communicator uses ![highlight.js](https://highlightjs.org/) to manage the code highlighting, ![KaTeX](http://khan.github.io/KaTeX/) to manage the LaTeX, and ![PageDown](https://code.google.com/p/pagedown/wiki/PageDown) to parse markdown. Upon arriving at facebook, it begins to causually check if there are any fleurons on the page. When it finds one, it begins scanning the messages every few seconds, finding ones with fleurons, and parsing them. The parsing is accomplished relatively quickly with a single scan through and a trie-like decision tree or something, I don't know much about algorithms but I was pretty happy with that. 

The actual code that I wrote is in data/firefoxAddon.js (this code is included with every facebook page when you have the plugin) and lib/main.js

Going Forward
---
1. Improve markdown rendering, get rid of extra spaces
2. Add more blocks, like ```<i>``` and ```<strong>```
3. Add options, like highlight.js themes, latex parsing inline or outline
4. Add an ability to insert special characters (simple context menu and panel option)
5. Maybe add a bit of a GUI? Like, very subtle but perhaps expandable, add in colors and sizes and other style options there
6. Implement in Chrome! And in Firefox Mobile, that should be relatively easy.
