var defaulttxt = "# Welcome to Qute!\n\
\n\
**Qute** is an experimental text editor. You can learn more about it at:\n\
\n\
&gt; **http://www.inkcode.net/qute**\n\
\n\
Here is how to use Qute:\n\
\n\
1. To edit a paragraph, click on it.\n\
2. When done editing, double click the paragraph.\n\
\n\
You can use **Markdown** syntax for formatting and **TeX** syntax for formulas.\n\
\n\
The **Q** in the top left corner opens the **menu**, which you can use to save and load text files and switch **themes**.\n\
\n\
## News\n\
\n\
This release, Qute 0.4, is a small bugfix release. There are a few known issues, which are listed at http://github.com/fbreuer/qute-html5/issues.\n\
\n\
For the next release, Qute 0.5, a rewrite of large parts of Qute is\n\
  planned, which means more features and a cleaner implementation at\n\
  the expense of some convenience functions.\n\
\n\
## Custom Languages\n\
\n\
Qute allows you to define and transform your own custom markup languages. This feature is still very experimental, but here is a small demo. Consider the following calculator language called 'mylang', defined in OMeta syntax.\n\
\n\
@ometa:mylang\n\
ometa Calc <: Parser {\n\
  var           = spaces letter:x      -> x,\n\
  num           = num:n digit:d        -> (n*10 + d*1)\n\
                | digit:d              -> (d*1),\n\
  primaryExpr   = spaces var:x         -> self.vars[x]\n\
                | spaces num:n         -> n\n\
                | '(' expr:r ')'       -> r,\n\
  mulExpr       = mulExpr:x '*' primaryExpr:y -> ( x * y )\n\
                | mulExpr:x '/' primaryExpr:y -> ( x / y )\n\
                | primaryExpr,\n\
  addExpr       = addExpr:x '+' mulExpr:y     -> ( x + y )\n\
                | addExpr:x '-' mulExpr:y     -> ( x - y )\n\
                | mulExpr,\n\
  expr          = var:x  '=' expr:r           -> (self.vars[x] = r)\n\
                | addExpr,\n\
  doit          = (expr:r)* spaces end        -> r\n\
}\n\
Calc.initialize = function() {  this.vars = {}; }\n\
function(source) {return Calc.matchAll(source,'doit',undefined,parseError)}\n\
\n\
Then, a paragraph containing an expression in this small caluclator language, such as for example\n\
 \n\
    @mylang\n\
    x=6\n\
    y=5+3\n\
    x*(y-1)\n\
 \n\
will be automatically transformed into its result. The prefix @mylang tells Qute which language the paragraph is written in. Here is the result:\n\
\n\
@mylang\n\
x=6\n\
y=5+3\n\
x*(y-1)\n\
\n\
You may note that the above language does not allow for unary negation. Entering a negative number will result in a parse error. Parse errors are reported like this:\n\
\n\
@mylang\n\
x=6\n\
y=-5+3\n\
x*(y-1)\n\
\n\
Check out the next development version of Qute for a more useful example of a custom language.\n\
\n\
## Keyboard Shortcuts\n\
\n\
**Enter** - split paragraph at the current cursor position.\n\
\n\
**Ctrl+Enter** - insert new empty paragraph.\n\
\n\
**Shift+Enter** - add new line to current paragraph.\n\
\n\
**Esc** - toggle menu.\n\
\n\
**Ctrl+S** or **F5** - save.\n\
\n\
**F9** - load.\n\
\n\
**F11** - toggle fullscreen.\n\
\n\
**F12** - toggle two column mode.\n\
\n\
**Ctrl+T** - switch all paragraphs to display mode.\n\
\n\
**Ctrl+Up** and **Ctrl+Down** - change focus to previous/next paragraph.\n\
\n\
**Ctrl+Shift+Up** and **Ctrl+Shift+Down** - move current paragraph up/down.\n\
\n\
**Backspace** and **Del** - join paragraphs when the cursor is at the beginning/end of one.\n\
\n\
**Ctrl+Alt+Up** and **Ctrl+Alt+Down** - join paragraphs.\n\
\n\
To **delete** a paragraph, just join it to the previous one, or double-click it, while it's empty.\n\
\n\
A note for **Mac users**: in the above list of keyboard shortcuts, you can use Cmd instead of Ctrl as well.\n\
\n\
## Notes\n\
\n\
Qute saves and loads plain text that you can **edit with any other text editor**. Make sure, though, that your text editor uses **UTF-8** encoding and **Unix-style line endings** ('\\n' instead of '\\r\\n'). **Paragraphs are separated by blank lines**, i.e., by the character sequence '\\n\\n'.\n\
\n\
Qute does **not support undo and redo**. You may try Ctrl+Z and Ctrl+Y, but unpredictable things may happen.\n\
\n\
Qute is **experimental** software, so many things may not work. In particular, Qute comes **without warranty** of any kind.\n\
\n\
Qute is built on many great pieces of software, in particular **Showdown**, **MathJax** and **Chromeless**.\n\
\n\
Feedback is very welcome! Visit **http://www.inkcode.net/qute** to get in touch.\n\
"
