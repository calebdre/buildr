import requests
import json
from flask import Flask
from flask import request
from pyquery import PyQuery as pq
from flask import jsonify

def findBestItem(items):
	if not isinstance(items, list):
		items = [items]
	
	infos = []
	for item in items:
		searchUrl = "http://www.homedepot.com/b/N-5yc1vZbwo5o/Ntk-semanticsearch/Ntt-{}}}?NCNI-5".format(item)
		html = pq(url=searchUrl)
		firstProduct = html("#products .pod-plp__container .js-pod-0")

		info = {}
		info["imageUrl"] = firstProduct("img").attr("src")
		info["productName"] = firstProduct(".pod-plp__description").text()
		info["url"] = "http://www.homedepot.com" + firstProduct(".pod-plp__description a").attr("href")
		info["productId"] = "http://www.homedepot.com" + info["url"].split("/")[0][-1:0]
		info["addToCartLink"] = firstProduct(".pod-plp__atc-bttn a").attr("href")
		info["productModel"] = firstProduct(".pod-plp__model").text()
		info["numOfReviews"] = firstProduct(".pod-plp__ratings a").text()[1:][:-1]
		priceSplitted = firstProduct(".price__wrapper .price").text().split(" ")
		info["price"] = priceSplitted[0] + priceSplitted[1] + "." + priceSplitted[2]
		info["priceFloat"] = float(priceSplitted[1] + "." + priceSplitted[2])
		infos.append(info)
	
	totalPrice = sum([i["priceFloat"] for i in infos])

	response = {}
	response["totalPrice"] = totalPrice
	response["items"] = infos
	return response


# print(findBestItem(["hammer", "nail", "2x4 wood"]))

# format: ("Latitude,Longitude")
def findStoreID(lat_lon):
	urlOpen = "http://www.homedepot.com/l/search/" + lat_lon +"/full/"
	html = pq(url=urlOpen)
	storeID = html(".sfstorename:eq(0)").text().split("#", 1)[1]
    
	return(storeID)


# accepts String for location and a list for productIDs ["12321321","12321312"]
def returnAsileNum(location, productIDs):
    storeNum = findStoreID(location)
    returnedNumbers = []
    for i in range(len(productIDs)):
        asileNum = "http://api.homedepot.com/v3/catalog/aislebay?storeSkuid=" \
                   + productIDs[i] + "&storeid=" \
                   + storeNum + "&type=json&key=8GdxXVBsFAzhkvLfn78NLnzQkDZme0KW"
        asileNumJson = pq(url=asileNum).text()
        parsed_json = json.loads(asileNumJson)
        returnedNumbers.append(parsed_json["storeSkus"][0]["aisleBayInfo"]["aisle"])

    return(returnedNumbers) # returns a list of asile numbers


app = Flask(__name__)

@app.route("/check_best_products")
def check_best_products():
	q = request.args.get("q").split(",")
	bestItems = findBestItem(q)
	return jsonify(bestItems);

@app.route("/get_product_ailes")
def get_product_ailes():
	lat = request.args.get("lat")
	lng = request.args.get("lng")
	latLng = str(lat) + "," + str(lng)
	productIds = request.args.get("productIds").split(",")

	return jsonify(returnAsileNum(latLng,productIds))

app.run()