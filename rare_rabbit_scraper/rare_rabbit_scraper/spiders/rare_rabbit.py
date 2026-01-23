import scrapy
import json

class RareRabbitSpider(scrapy.Spider):
    name = "rare_rabbit"
    allowed_domains = ["thehouseofrare.com"]
    start_urls = ["https://thehouseofrare.com/collections/rare-rr-men-shirts/products.json?page=1"]

    def parse(self, response):
        data = json.loads(response.body)
        products = data.get("products", [])
        
        if not products:
            self.logger.info("No more products found. Stopping.")
            return

        for product in products:
            yield {
                "id": product.get("id"),
                "title": product.get("title"),
                "handle": product.get("handle"),
                "vendor": product.get("vendor"),
                "product_type": product.get("product_type"),
                "tags": product.get("tags"),
                "variants": product.get("variants"),
                "images": [img.get("src") for img in product.get("images", [])],
                "options": product.get("options"),
                "created_at": product.get("created_at"),
                "updated_at": product.get("updated_at"),
                "published_at": product.get("published_at"),
            }

        # Handle pagination
        current_page = int(response.url.split("page=")[-1])
        next_page = current_page + 1
        next_url = f"https://thehouseofrare.com/collections/rare-rr-men-shirts/products.json?page={next_page}"
        
        yield scrapy.Request(next_url, callback=self.parse)
