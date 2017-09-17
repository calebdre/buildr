import requests
import json
from pyquery import PyQuery as pq

def findBestItem(item):
	searchUrl = "http://www.homedepot.com/b/N-5yc1vZbwo5o/Ntk-semanticsearch/Ntt-{}}}?NCNI-5".format(item)
	html = pq(url=searchUrl)
	firstProduct = html("#products .pod-plp__container .js-pod-0")

	info = {}
	info["imageUrl"] = firstProduct("img").attr("src")
	info["productName"] = firstProduct(".pod-plp__description").text()
	info["url"] = "http://www.homedepot.com" + firstProduct(".pod-plp__description a").attr("href")
	info["addToCartLink"] = firstProduct(".pod-plp__atc-bttn a").attr("href")
	info["productModel"] = firstProduct(".pod-plp__model").text()
	info["numOfReviews"] = firstProduct(".pod-plp__ratings a").text()[1:][:-1]

	return json.dumps(info, ensure_ascii=False)


print(findBestItem("hammer"))