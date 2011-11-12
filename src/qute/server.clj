(ns qute.server
  (:use noir.core)
  (:use hiccup.core)
  (:use hiccup.page-helpers)
  (:require [noir.server :as server]))

(defpartial qute-main-page []
  (html5
   [:head
    (map include-css ["/css/main.css",
                      "/css/print.css",
                      "/fonts/cosmetica/font.css",
                      "/themes/subtle-dark/theme.css"])
    (include-js "/cljs/bootstrap.js")
    [:title "Qute 0.5pre"]]
   [:body {:onload "qute.init();"}
    [:a#menuanchor "Q"]
    [:div#outline]
    [:div#scroll-area
     [:div#column]]
    [:div#notify-area]]))

(defpage "/" []
  (qute-main-page))

(server/start 8080)

