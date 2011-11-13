<?xml version="1.0" encoding="utf-8"?>
<!-- Created by Leo (http://webpages.charter.net/edreamleo/front.html) -->
<?xml-stylesheet ekr_test?>
<leo_file xmlns:leo="http://www.leo-editor.org/2011/leo" >
<leo_header file_format="2" tnodes="0" max_tnode_index="0" clone_windows="0"/>
<globals body_outline_ratio="0.5" body_secondary_ratio="0.5">
	<global_window_position top="50" left="50" height="500" width="700"/>
	<global_log_window_position top="0" left="0" height="0" width="0"/>
</globals>
<preferences/>
<find_panel_settings/>
<vnodes>
<v t="fbreuer.20111104102808.1226" a="E"><vh>Qute</vh>
<v t="fbreuer.20111104102808.1227" a="E"><vh>Qute-TODO</vh>
<v t="fbreuer.20111104102808.1232" a="E"><vh>Branch 0.5</vh>
<v t="fbreuer.20111104102808.1240"><vh>UI Mockup</vh></v>
<v t="fbreuer.20111112151513.1291"><vh>switching between different modes</vh></v>
<v t="fbreuer.20111112151513.1283"><vh>rudimentary editing ui</vh></v>
<v t="fbreuer.20111112151513.1287"><vh>save to file</vh></v>
<v t="fbreuer.20111112151513.1285"><vh>ometa integration</vh></v>
<v t="fbreuer.20111112151513.1286"><vh>export source files</vh></v>
<v t="fbreuer.20111112151513.1288"><vh>sophisticated attribute editor</vh></v>
<v t="fbreuer.20111112151513.1289"><vh>attribute editing</vh></v>
<v t="fbreuer.20111112151513.1290"><vh>popup menu</vh></v>
<v t="fbreuer.20111112151513.1284"><vh>links in attributes</vh></v>
</v>
</v>
<v t="fbreuer.20111104102808.1256" a="E"><vh>Notes</vh>
<v t="fbreuer.20111112151513.1282"><vh>Smooth Fonts in Firefox</vh></v>
<v t="fbreuer.20111112000603.1284"><vh>Emacs</vh></v>
<v t="fbreuer.20111104102808.1258"><vh>Connecting Browser to REPL</vh></v>
<v t="fbreuer.20111104102808.1259" a="E"><vh>Workflow</vh>
<v t="fbreuer.20111110211122.1279"><vh>Command Line</vh></v>
<v t="fbreuer.20111110211122.1278" a="E"><vh>Leiningen</vh>
<v t="fbreuer.20111110211122.1280"><vh>Preparations</vh></v>
</v>
</v>
<v t="fbreuer.20111104102808.1257"><vh>Compiling ClojureScript from Clojure REPL</vh></v>
</v>
<v t="fbreuer.20111104102808.1235" a="E"><vh>Ideas</vh>
<v t="fbreuer.20111104102808.1236"><vh>keep code in leo?</vh></v>
</v>
<v t="fbreuer.20111104102808.1241" a="E"><vh>Build System</vh>
<v t="fbreuer.20111104102808.1242"><vh>compilejs.py</vh></v>
<v t="fbreuer.20111104102808.1252"><vh>release.py</vh></v>
</v>
<v t="fbreuer.20111104102808.1253" a="E"><vh>Program</vh>
<v t="fbreuer.20111112151513.1281"><vh>Snippets</vh></v>
</v>
<v t="fbreuer.20111105135419.1260" a="E"><vh>Specification</vh>
<v t="fbreuer.20111105135419.1263" a="E"><vh>UI State</vh>
<v t="fbreuer.20111105135419.1266"><vh>Outline</vh></v>
<v t="fbreuer.20111105135419.1267"><vh>Body</vh></v>
<v t="fbreuer.20111105135419.1268"><vh>Occurrences - Vertices</vh></v>
</v>
<v t="fbreuer.20111105135419.1261" a="E"><vh>Actions</vh>
<v t="fbreuer.20111105135419.1264"><vh>Document actions</vh></v>
<v t="fbreuer.20111105135419.1265"><vh>UI actions</vh></v>
</v>
<v t="fbreuer.20111105135419.1262"><vh>Input Mapping</vh></v>
</v>
</v>
</vnodes>
<tnodes>
<t tx="fbreuer.20111104102808.1226"></t>
<t tx="fbreuer.20111104102808.1227"></t>
<t tx="fbreuer.20111104102808.1232"></t>
<t tx="fbreuer.20111104102808.1235"></t>
<t tx="fbreuer.20111104102808.1236">Drawbacks:
    
    * Leo is constantly complaining about orphan nodes. Is there a way to turn this off?
    * Leo does not support Clojure syntax.</t>
<t tx="fbreuer.20111104102808.1240"></t>
<t tx="fbreuer.20111104102808.1241">old buildsystem, currently we use leiningen and cljs-watch</t>
<t tx="fbreuer.20111104102808.1242">import os
import os.path
import shutil
import subprocess

abovebuilddir = "src"
builddir = "src/js"
sourcedir = "src"
cljscexe = "cljsc"

try:
    os.makedirs(builddir)
except:
    pass
    
subprocess.call([cljscexe, sourcedir, '{:output-dir "' + builddir + '" :output-to "' + abovebuilddir + '/qute.js"}'], shell=True)
</t>
<t tx="fbreuer.20111104102808.1252">import os
import os.path
import shutil
import subprocess

builddir = "build"
sourcedir = "src"
cljscexe = "cljsc"

try:
    shutil.rmtree(builddir)
except:
    pass
    
shutil.copytree(os.path.join(sourcedir,"html"),builddir)

for f in ["LICENSE-AGPL","README.md", "src\icon.ico"]:
    shutil.copy(f,builddir)
    
subprocess.call([cljscexe, sourcedir, '{:output-dir "' + builddir + '" :output-to "' + builddir + '/qute.js"}'], shell=True)
</t>
<t tx="fbreuer.20111104102808.1253"></t>
<t tx="fbreuer.20111104102808.1256"></t>
<t tx="fbreuer.20111104102808.1257">(require '[cljs.closure :as cljsc])
(cljsc/build "src" {:output-dir "src/js" :output-to "src/qute.js"})</t>
<t tx="fbreuer.20111104102808.1258">1) In clj REPL

(require '[cljs.repl :as repl])
(require '[cljs.repl.browser :as browser])  ;; require the browser implementation of IJavaScriptEnv
(def env (browser/repl-env)) ;; create a new environment
(repl/repl env) ;; start the REPL

2) In Browser

(ns foo
  (:require [clojure.browser.repl :as repl]))
(repl/connect "http://localhost:9000/repl")

;; happens automatically now!
;; just reload!</t>
<t tx="fbreuer.20111104102808.1259"></t>
<t tx="fbreuer.20111105135419.1260"></t>
<t tx="fbreuer.20111105135419.1261">Which actions do I want to support in the first iteration?

Here an *action* means an operation that modifies the *document state* or the *ui state*.</t>
<t tx="fbreuer.20111105135419.1262">Given the state of the UI, which UI gestures trigger which actions?</t>
<t tx="fbreuer.20111105135419.1263">The UI has several components each of which have a state.


</t>
<t tx="fbreuer.20111105135419.1264">Here come the actions that modify the document. These are relatively few.

* set block content
* set/remove block attribute
* delete block
* create block
* move block
  - absolute movement
    - insert at particular spot
  - relative movement
    - move up/down/left/right
* clone block (create cyclic structure)</t>
<t tx="fbreuer.20111105135419.1265"></t>
<t tx="fbreuer.20111105135419.1266"># State

The outline is a tree with folding and hyperlinks. It also has an active node and a scroll bar.

The UI state of the outline is determined by (b,v,y,S) where b is a boolean specifying whether the outline is visible, v is the currently active node, y is the y-scroll position and S is the set of unfolded nodes. Note that for a vertex that appears at multiple positions in the tree, using a set S does not suffice. We have to say *which* occurences of the vertex in the tree are expanded. It is not clear what we mean by occurrences. The most straightforward way to define this is to define an occurrence as a path from the root of the directed graph to the vertex. But this seems like overkill for most purposes. Instead, we could save a pair of vertex and parent (v,p) to denote that v is expanded when displayed as a child of p. We might also want to enforce that only one instance of a vertex can be open at any given time.


IDEA: maybe use D3 to create a tree control which can be encapsulated?

TODO: How to represent hyperlinks visually? &lt;- Just using indentation and icons in front of the lines.</t>
<t tx="fbreuer.20111105135419.1267"># State

The state of the body is given by a tuple (S, vroot, focused, editing) where 

* S is a set of visible vertices. Here we again have the issue that some elements may be folded, while others are not. Also, the visible elements cannot just be identified with vertices, rather they have to be indentified with _occurences_ of vertices.
* vroot is the _parent_ of all the elements that are visible in he body.
* focused is an element of S which denotes the element that currently has focus. 
* editing is either an element of S which is currently edited, or none, which means that no element is currently edited.</t>
<t tx="fbreuer.20111105135419.1268">Here we define a labeled traversal of a document graph.

The input, apart from the graph, is the following: (root, Occ).

* root is a vertex of the graph.
* Occ is a set of occurrences. An occurrence is a pair (v, p), where v is a vertex and p is a vertex with (p, v) \in E.

traverse v Occ p d
  draw-expanded v d
  for w in children(v)
    if (w,v) in Occ
      traverse w (Occ - (w,v)) v d+1
    else
      draw-collapsed w d 
      
draw-expanded draws the content and attributes of v when v is expanded.

draw-collapsed draws the content and attributes of v when v is collapsed.

here d is a depth parameter</t>
<t tx="fbreuer.20111110211122.1278">1) lein run

to start the noir server from the project directory

if there are errors here, try deleting the lib and classes directories. also, you may have to kill stale processes.

2) cljs-watch

to start live-compiling of clojurescript files

3) edit away!


</t>
<t tx="fbreuer.20111110211122.1279">1) Open REPL for compiling

2) Open REPL for interaction with browser
- if possible it would be good to run this repl in Emacs
- I can't get swank-clojure to work without installing Leiningen, which I'd rather avoid.
- So, start the repls from shells inside Emacs.
- To open *two* shells in Emacs use C-u M-x shell.

3) Open index.html in browser

4) Open source files in editor</t>
<t tx="fbreuer.20111110211122.1280">Install clojurescript
Install cljs-watch
Install leiningen

Create project.clj referencing noir and pinot
</t>
<t tx="fbreuer.20111112000603.1284">Rename buffer

M-x rename-buffer &lt;RET&gt; [name] &lt;RET&gt;</t>
<t tx="fbreuer.20111112151513.1281">(ns qute.io
  (:require [cljs.reader :as reader]
            [goog.storage.Storage :as storage]
            [goog.storage.mechanism.HTML5LocalStorage :as h5storage]
            ))

(defn read-document [str]
  (reader/read-string str))

(defn write-document [doc]
  (pr-str doc))

(defn save-document [path]
  (let [stor (goog.storage.Storage. (goog.storage.mechanism.HTML5LocalStorage.))]
    (.set stor path (write-document (deref *doc*)))
    ))

(defn load-document [path]
  (let [stor (goog.storage.Storage. (goog.storage.mechanism.HTML5LocalStorage.))]
    (reset! *doc* (read-document (.get stor path)))
    ))

(ns qute.outline.render
  (:require-macros [hiccups.core :as hiccups])
  (:require [hiccups.runtime :as hiccupsrt]
            [qute.doc :as qdoc]))

(defn redraw-outline-visitor )

(defn redraw-outline [doc expanded-occurrences]
  ;; clear outline element
  ;; prepare outline element
  ;; run the traversal
  (let [outline-elt
        html-vec (qdoc/traverse doc )
        write ;; convert to dom elements and append to correct elt
        visitor-fn (fn [doc v expanded depth]
                     (write
                      [:span {:class "outline-row"
                              :style (join "padding-left: " (*depth 10) "px")}
                       [:span "outline-bullet" (if expanded "-" "+")]
                       [:span "outline-caption" (get-in doc [:content v])]]))]))

(ns qute
  (:require [cljs.reader :as reader]
            [clojure.browser.repl :as repl]))

;; we always want to connect to a repl!
(repl/connect "http://localhost:9000/repl")</t>
<t tx="fbreuer.20111112151513.1282">pref("gfx.direct2d.disabled", true);
pref("layers.acceleration.disabled", true);
</t>
<t tx="fbreuer.20111112151513.1283">* attribute editing via one large text field
* no comprehensive keybindings/no comprehensive mouse interface</t>
<t tx="fbreuer.20111112151513.1284"></t>
<t tx="fbreuer.20111112151513.1285"></t>
<t tx="fbreuer.20111112151513.1286"></t>
<t tx="fbreuer.20111112151513.1287">via server</t>
<t tx="fbreuer.20111112151513.1288"></t>
<t tx="fbreuer.20111112151513.1289">for each key/value pair, a popup window: crude but effective for a first iteration</t>
<t tx="fbreuer.20111112151513.1290"></t>
<t tx="fbreuer.20111112151513.1291">4 modes for each block:
    
    * display
    * edit-contents
    * edit-attributes
    * collapsed
    
maybe, editing attributes and editing contents are independent concerns. how about using 3 modes instead:
    
    * display
    * edit
    * collapsed
    
and toggle, independently of the mode, whether attributes are shown or not.</t>
</tnodes>
</leo_file>
