#!/usr/bin/env python
import pyrebase
from functools import wraps
import json
from flask import Flask, make_response
from flask import request
from pyquery import PyQuery as pq
from flask import jsonify
from twilio.rest import Client

accountSid = "ACef4516da75e401c1417f2d0836738524"
authToken  = "8a9ad7fa67f7d9b0bbcf144377b2fed4"

firebaseConfig = {
  "apiKey": "AIzaSyCeeGGImxoRGjokqulhtW791YpsreZpA8o",
  "databaseURL": "https://d2l-scraper.firebaseio.com/",
  "authDomain": "",
  "storageBucket": ""
}

def add_response_headers(headers={}):
    """This decorator adds the headers passed in to the response"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            resp = make_response(f(*args, **kwargs))
            h = resp.headers
            for header, value in headers.items():
                h[header] = value
            return resp
        return decorated_function
    return decorator

def findBestItem(items):
	if not isinstance(items, list):
		items = [items]
	
	infos = []
	for item in items:
		try:
			searchUrl = "http://www.homedepot.com/b/N-5yc1vZbwo5o/Ntk-semanticsearch/Ntt-{}}}?NCNI-5".format(item)
			html = pq(url=searchUrl)
			firstProduct = html("#products .pod-plp__container .js-pod-0")

			info = {}
			info["imageUrl"] = firstProduct("img").attr("src")
			info["productName"] = firstProduct(".pod-plp__description").text()
			info["url"] = "http://www.homedepot.com" + firstProduct(".pod-plp__description a").attr("href")
			info["productId"] = info["url"].split("/")[-1]
			info["addToCartLink"] = firstProduct(".pod-plp__atc-bttn a").attr("href")
			info["productModel"] = firstProduct(".pod-plp__model").text()
			info["numOfReviews"] = firstProduct(".pod-plp__ratings a").text()[1:][:-1]
			priceSplitted = firstProduct(".price__wrapper .price").text().split(" ")
			info["price"] = priceSplitted[0] + priceSplitted[1] + "." + priceSplitted[2]
			info["priceFloat"] = float(priceSplitted[1] + "." + priceSplitted[2])
			info["found"] = True
			infos.append(info)
		except:
			infos.append({"found":False})
	
	totalPrice = 0
	
	for i in infos:
		if "priceFloat" in i:
			totalPrice = totalPrice + i["priceFloat"]
	

	response = {}
	response["totalPrice"] = totalPrice
	response["items"] = infos
	return response

# format: ("internetID, storeID")
def returnProductNameANDsku(internetID, storeID):
    urlOpen = "http://api.homedepot.com/v3/catalog/products/sku?type=json&itemId="+internetID+"&storeId="+storeID+"&detaAddress=30308&show=pricing,itemAvailability,inventory,aisleBinInfo,media,attributeGroups,ratingsReviews,info,shipping,dimensions,storeAvailability,promotions,fulfillmentOptions&additionalAttributeGrp=notDisplayed&key=8GdxXVBsFAzhkvLfn78NLnzQkDZme0KW"
    html = pq(url=urlOpen).text()
    parsed_json = json.loads(html)
    productLabel = parsed_json["products"]["product"]["skus"]["sku"]["info"]["productLabel"]
    brandName = parsed_json["products"]["product"]["skus"]["sku"]["info"]["brandName"]
    productName = brandName + " " + productLabel
    sku = parsed_json["products"]["product"]["skus"]["sku"]["info"]["storeSkuNumber"]
    return productName, sku # returns the productName and sku number as strings

# print(findBestItem(["hammer", "nail", "2x4 wood"]))

# format: ("Latitude,Longitude")
def findStoreID(lat_lon, n=0):
	urlOpen = "http://www.homedepot.com/l/search/" + lat_lon +"/full/"
	html = pq(url=urlOpen)
	storeID = html(".sfstorename:eq("+str(n)+")").text().split("#", 1)[1]
	storeAddress = html(".sfstoreaddress:eq("+str(n)+")").text()
    
	return (storeID, storeAddress) # returns a string with the storeID

# accepts String for location and a list for productIDs ["12321321","12321312"]
def returnAsileNum(location, productIDs, n=0):
	storeId, storeAddress = findStoreID(location, n)
	print(storeAddress, productIDs)
	returnedNumbers = {}
	returnedNumbers["address"] = storeAddress
	returnedNumbers["aisles"] = []

	print(n)
	productNames = []
	for p in productIDs:
		try:
			name, sku = returnProductNameANDsku(p, storeId)
			productNames.append({"name": name, "sku": sku, "id": p})
		except:
			productNames.append({"missing": True})

	for product in productNames:
		if "missing" in product:
			continue
		asileNum = "http://api.homedepot.com/v3/catalog/aislebay?storeSkuid="+ str(product["sku"]) + "&storeid=" + str(storeId) + "&type=json&key=8GdxXVBsFAzhkvLfn78NLnzQkDZme0KW"
		
		try:
			asileNumJson = pq(url=asileNum).text()
			parsed_json = json.loads(asileNumJson)
			returnedNumbers["aisles"].append({"name":product["name"], "aisle": parsed_json["storeSkus"][0]["aisleBayInfo"]["aisle"]})
		except:
			returnedNumbers["aisles"].append({"name":product["name"], "aisle": -1, "id":product["id"]})
	
	return returnedNumbers

def checkForAvailability(lat_lon,productID,n):
	return(returnAsileNum(lat_lon, productID, n))


def sendTextMessage(phone, storeAddress, products):
	message = "Here are the aisle for your products at The Home Depot on " + storeAddress + ":\n\n"
	for product in products: 
		if product["aisle"] == -1:
			message += product["name"] + " was not found at your store :(\n\n" 
		else:
			message += "the " + product["name"] + " is in aisle " + product["aisle"] + "\n\n"

	twilioclient = Client(accountSid, authToken)
	twilioclient.messages.create(
		to="+1" + str(phone), 
		from_="+14703090394",
		body=message)

app = Flask(__name__)

# pass in q, a list of comma separated strings to be 
# looked up. These need to be really specific or else it won't work. 
# like passing in "wood" won't work, but "2x4 wood" will
# example: http://127.0.0.1:5000/check_best_products?q=hammer,nails,2x4%20wood
@app.route("/check_best_products")
@add_response_headers({'Access-Control-Allow-Origin': '*'})
def check_best_products():
	q = request.args.get("q").split(",")
	bestItems = findBestItem(q)
	return jsonify(bestItems);

# pass in a lat (latitude), lng (longitude), 
# phone (just number), and a comma separated 
# list of product ids obtained from /check_best_products
# all in the query parameters of the url.
# example: http://127.0.0.1:5000/send_text_message?lat=33.7753208&lng=-84.3909989&productIds=205594063,202308501,204673969,205594063&phone=7708810074
@app.route("/send_text_message")
@add_response_headers({'Access-Control-Allow-Origin': '*'})
def get_product_ailes():
	lat = request.args.get("lat")
	lng = request.args.get("lng")
	latLng = str(lat) + "," + str(lng)
	phone = request.args.get("phone")
	productIds = request.args.get("productIds").split(",")
	aisleNums = returnAsileNum(latLng,productIds)


	message = "Here are the aisle for your products at The Home Depot on " + aisleNums["address"] + ":\n\n"
	for product in aisleNums["aisles"]: 
		if product["aisle"] == -1:
			message += product["name"] + " was not found at your store :(\n\n" 
		else:
			message += "the " + product["name"] + " is in aisle " + product["aisle"] + "\n\n"

	firebase = pyrebase.initialize_app(firebaseConfig)
	db = firebase.database()
	p = {}
	p["missing_products"] = []
	p["responses"] = 0
	p["latlng"] = latLng
	missing = False
	for product in aisleNums["aisles"]:
		if product["aisle"] == -1:
			p["missing_products"].append(product["id"])
			missing = True
	
	db.child("buildr").child(phone).set(p)

	if missing == True:
		message += "Would you like to search other Home Depots near you for the missing products? (yes/no)"

	twilioclient = Client(accountSid, authToken)
	twilioclient.messages.create(
		to="+1" + str(phone), 
		from_="+14703090394",
		body=message)

	return jsonify({"success":True})


@app.route("/twilio/text_response", methods=["POST"])
def twilio_text_response():
	fromNum = request.form.get("From")[1:]
	body = request.form.get("Body")

	if body == "yes" or body == "Yes":
		firebase = pyrebase.initialize_app(firebaseConfig)
		db = firebase.database()
		value = db.child("buildr").child(fromNum[1:]).get().val()
		ids = value["missing_products"]
		originalResponsesNumber = value["responses"]
		
		availabilities = []
		online = []
		counter = originalResponsesNumber
		
		for i in ids:
			av = checkForAvailability(value["latlng"], i, originalResponsesNumber + counter)
			try:
				while len(av["aisles"]) == 0:
					counter = counter + 1
					av = checkForAvailability(value["latlng"], i, originalResponsesNumber + counter)
					availabilities.append(av)
			except:
				av["online"] = True
				online.append(av)

		db.child("buildr").child(fromNum[1:]).update({"responses": originalResponsesNumber + counter})
		availabilities = []
		addresses = {}
		for av in availabilities: 
			if av["address"] not in addresses:
				addresses[av["address"]] = []
			
			addresses[av["address"]].append(av)
		
		message = "We found "
		for address in addresses:
			if len(addresses[address]) == 1:
				message += addresses[address][0]["name"]
			elif len(addresses[address]) == 2:
				message += addresses[address][0]["name"] + " and " + addresses[address][1]["name"]
			else:
				message += [a["name"] for a in addresses[address]].join(", ")
			
			message += " at The Home Depot on " + address
		
		if message == "We found ":
			message = ""
		else:
			message += "\n\n"
		
		message += "Sorry, the other products are online only."
		
		twilioclient = Client(accountSid, authToken)
		twilioclient.messages.create(
			to=fromNum, 
			from_="+14703090394",
			body=message)

		return jsonify({"success": True})
	return jsonify({"success": False})

if __name__ == '__main__':
      app.run(host='0.0.0.0', port=5000)
