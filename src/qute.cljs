(ns qute.doc)

;; Document is a map with attributes :adj :attr :content and :root.

(def *example-doc* {:adj {1 [2 3 4] 2 [] 3 [] 4 []}
                    :attr {}
                    :content {1 "this is the root node" 2 "Hello World" 3 "This is a test for Qute 0.5." 4 "Let's hope this works."}
                    :root 1})

;; TODO: create a validator function for documents

;; we need to have infrastructure for modifying documents

(defn 
  ^{:doc "Returns a new document based on doc in which the content of vertex v has been set to content."}
  set-vertex-content [doc v content]
  (assoc-in doc [:content v] content))

(defn 
  ^{:doc "Returns a new document based on doc in which the value of attribute attr of vertex v has been set to val."}
  set-vertex-attribute [doc v attr val]
  (assoc-in doc [:attr v attr] val))

(defn 
  ^{:doc "Returns a new document based on doc in which in which the attribute attr of vertex v has been removed."}
  remove-vertex-attribute [doc v attr]
  (assoc-in doc [:attr v] (dissoc (get-in doc [:attr v]) attr)))
;; could also be written as (dissoc-in doc [:attr v attr])

;; TODO:
;; * create vertex
;; * delete vertex
;; * move vertex
;; * clone vertex

;; document traversal

;; there is really no more convenient way to do this?
(defn in [val col]
  (assert (not (nil? val)))
  (not (nil? (some #{val} col))))

(defn
  ^{:doc "traverse"}
  traverse [doc visit-fn expanded-occurrences root]
  (traverse-helper doc visit-fn expanded-occurrences (- 1) root nil))

(defn
  ^{:doc "traverse-helper. visit-fn takes four arguments [doc v expanded depth] where doc is the document, v is the current vertex, expanded is a boolean indicating whether v is expanded, and depth is an integer indicating the depth wrt the root of the traversal."}
  traverse-helper [doc visit-fn expanded-occurrences depth v p]
  (let [expanded (in [v,p] expanded-occurrences)] ;this tests if
                                        ; [v,p] is in exp-occ
    (visit-fn doc v expanded depth)
    (if expanded
      (let [children (get-in doc [:adj v])]
        (doseq [w children]
          (traverse-helper doc visit-fn (disj expanded-occurrences [v,p]) (inc depth) w v))))))

(ns qute.blocks
  (:require [qute.doc :as qd]
            [pinot.dom :as dom]
            [pinot.html :as html]
            [pinot.events :as events]))

(defn render-document [doc expanded-occurrences root]
  (let [visit-fn (fn [doc v expanded depth]
                   (dom/append
                    (dom/query "#column")
                    (block-to-html doc v expanded depth)))]
    (qd/traverse doc visit-fn expanded-occurrences root)))

(defn block-to-html [doc v expanded depth]
  (if expanded
    (html/html [:div.block
                [:div.block-header]
                [:div.block-controls]
                [:textarea.block-source {:rows 5}
                 (get-in doc [:content v])]
                [:div.block-rendering]])
    (html/html [:div.block.clone
                [:div.block-rendering "this is a clone" v]])))

(ns qute
  (:require [qute.doc :as qd]
            [qute.blocks :as qb]
            [pinot.dom :as dom]
            [pinot.events :as events]
            [cljs.reader :as reader]
            [clojure.browser.repl :as repl]))

(def *doc* (atom qd/*example-doc*))

(def *test* (atom "Hello"))

(defn init []
  (doseq [w [1 2 3]] (. js/console (log w)))
  (repl/connect "http://localhost:9000/repl")
  (dom/css (dom/query "#notify-area") "display" "none")
  (qb/render-document @*doc* #{[1,nil],[2,1],[3,1],[4,1]} (get @*doc* :root))
  )