import requests
import json
from pyquery import PyQuery as pq

def findBestItem(item):
	searchUrl = "http://www.homedepot.com/b/N-5yc1vZbwo5o/Ntk-semanticsearch/Ntt-{}}}?NCNI-5".format(item)
	html = pq(url=searchUrl)
	firstProduct = html("#products .pod-plp__container .js-pod-0")
	image = firstProduct("img")
	print(image.attr("src"))


findBestItem("hammer")